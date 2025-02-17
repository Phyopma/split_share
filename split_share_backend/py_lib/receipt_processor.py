from PIL import Image
import torch
import re
from transformers import DonutProcessor, VisionEncoderDecoderModel

# Step 1: Load the classification and parsing models
def load_models():
    # Load RVLCDIP model for document classification
    classifier_processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base-finetuned-rvlcdip")
    classifier_model = VisionEncoderDecoderModel.from_pretrained("naver-clova-ix/donut-base-finetuned-rvlcdip")
    
    # Load CORD-v2 model for receipt parsing
    parser_processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base-finetuned-cord-v2")
    parser_model = VisionEncoderDecoderModel.from_pretrained("naver-clova-ix/donut-base-finetuned-cord-v2")
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    # Move models to device and set to evaluation mode
    classifier_model.to(device).eval()
    parser_model.to(device).eval()
    
    if torch.cuda.is_available():
        classifier_model.half()
        parser_model.half()
    
    return classifier_processor, classifier_model, parser_processor, parser_model

# Step 2: Classify and Parse the Document
def process_document(image_path, classifier_processor, classifier_model, parser_processor, parser_model):
    # Load the image
    image = Image.open(image_path).convert("RGB")
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # Step 1: Document Classification
    # Prepare classification inputs
    classification_prompt = "<s_rvlcdip>"
    classifier_input_ids = classifier_processor.tokenizer(classification_prompt, add_special_tokens=False, return_tensors="pt").input_ids
    classifier_pixel_values = classifier_processor(image, return_tensors="pt").pixel_values

    # Move tensors to device
    classifier_pixel_values = classifier_pixel_values.to(device)
    classifier_input_ids = classifier_input_ids.to(device)

    # Perform classification
    with torch.no_grad():
        classifier_outputs = classifier_model.generate(
            pixel_values=classifier_pixel_values,
            decoder_input_ids=classifier_input_ids,
            max_length=classifier_model.decoder.config.max_position_embeddings,
            pad_token_id=classifier_processor.tokenizer.pad_token_id,
            eos_token_id=classifier_processor.tokenizer.eos_token_id,
            use_cache=True,
            bad_words_ids=[[classifier_processor.tokenizer.unk_token_id]],
            return_dict_in_generate=True
        )

    # Process classification results
    class_sequence = classifier_processor.batch_decode(classifier_outputs.sequences)[0]
    class_sequence = class_sequence.replace(classifier_processor.tokenizer.eos_token, "").replace(classifier_processor.tokenizer.pad_token, "")
    class_sequence = re.sub(r"<.*?>", "", class_sequence, count=1).strip()
    class_name = classifier_processor.token2json(class_sequence)["class"]
    
    # Check if the document is a receipt
    if "receipt" in class_sequence.lower() or "invoice" in class_sequence.lower():
        # Step 2: Receipt Parsing
        # Prepare parsing inputs
        parsing_prompt = "<s_cord-v2>"
        parser_input_ids = parser_processor.tokenizer(parsing_prompt, add_special_tokens=False, return_tensors="pt").input_ids
        parser_pixel_values = parser_processor(image, return_tensors="pt").pixel_values

        # Move tensors to device
        parser_pixel_values = parser_pixel_values.to(device)
        parser_input_ids = parser_input_ids.to(device)

        # Perform parsing
        with torch.no_grad():
            parser_outputs = parser_model.generate(
                pixel_values=parser_pixel_values,
                decoder_input_ids=parser_input_ids,
                max_length=parser_model.decoder.config.max_position_embeddings,
                pad_token_id=parser_processor.tokenizer.pad_token_id,
                eos_token_id=parser_processor.tokenizer.eos_token_id,
                use_cache=True,
                bad_words_ids=[[parser_processor.tokenizer.unk_token_id]],
                return_dict_in_generate=True
            )

        # Process parsing results
        parse_sequence = parser_processor.batch_decode(parser_outputs.sequences)[0]
        parse_sequence = parse_sequence.replace(parser_processor.tokenizer.eos_token, "").replace(parser_processor.tokenizer.pad_token, "")
        parse_sequence = re.sub(r"<.*?>", "", parse_sequence, count=1).strip()
        parsed_data = parser_processor.token2json(parse_sequence)

        return {
            "is_receipt": True,
            "document_type": class_name,
            "parsed_data": parsed_data
        }
    else:
        return {
            "is_receipt": False,
            "document_type": class_name,
            "message": "The uploaded image is not a receipt."
        }

# Step 3: Main Function
def main():
    # Load both classification and parsing models
    classifier_processor, classifier_model, parser_processor, parser_model = load_models()

    # Path to the test image
    image_path = "../public/3.png"  # Replace with the path to your test image

    # Process the image through the pipeline
    result = process_document(image_path, classifier_processor, classifier_model, parser_processor, parser_model)
    print(result)

# Run the script
if __name__ == "__main__":
    main()