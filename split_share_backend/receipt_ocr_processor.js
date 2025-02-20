import { extractTextFromImage } from "./ocr_processor.js";
import { extractReceiptInfo } from "./receipt_extractor.js";

async function processReceiptWithOCR(imagePath) {
  try {
    // First step: Extract text from image using OCR
    const { text, confidence } = await extractTextFromImage(imagePath);
    console.log("OCR Text:", text);
    // Second step: Process the OCR result through our receipt extractor
    const extractedInfo = await extractReceiptInfo(text);

    return {
      ocr_text: text, // Raw OCR text for reference/debugging
      structured_data: extractedInfo, // Structured receipt data
      confidence, // OCR confidence score
    };
  } catch (error) {
    console.error("Error processing receipt:", error);
    throw error;
  }
}

export { processReceiptWithOCR };

let image_path = "./public/2.jpg";
const ocr_text = processReceiptWithOCR(image_path);
console.log(ocr_text);
