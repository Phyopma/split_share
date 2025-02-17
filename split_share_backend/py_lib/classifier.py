from torch.nn.functional import softmax
from transformers import ViTFeatureExtractor, ViTForImageClassification
from PIL import Image
import torch
from torchvision.transforms import Compose, Resize, ToTensor, Normalize
import matplotlib.pyplot as plt  # For displaying images

# Step 1: Load the Saved Model and Feature Extractor
feature_extractor = ViTFeatureExtractor.from_pretrained(
    "../../models/fine_tuned_model")
model = ViTForImageClassification.from_pretrained(
    "../../models/fine_tuned_model")

print("Model and feature extractor loaded successfully.")

# Step 2: Define Image Preprocessing Function
transform = Compose([
    Resize((224, 224)),  # Resize images to 224x224 (ViT input size)
    ToTensor(),          # Convert images to PyTorch tensors
    # Normalize pixel values
    Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])


def preprocess_image(image_path):
    """
    Preprocess an image for inference.
    """
    image = Image.open(image_path).convert("RGB")
    pixel_values = transform(image).unsqueeze(0)  # Add batch dimension
    return pixel_values, image  # Return both preprocessed tensor and original image


# Step 3: Define Prediction Function


def predict_image_class(image_path):
    """
    Predict the class of an image using the fine-tuned model.
    """
    # Preprocess the image
    pixel_values, original_image = preprocess_image(image_path)

    # Display the image
    # plt.imshow(original_image)
    # plt.axis('off')  # Turn off axis
    # plt.title("Input Image")
    # plt.show()

    # Make prediction
    with torch.no_grad():
        outputs = model(pixel_values)
        logits = outputs.logits

    # Apply softmax to get probabilities
    probabilities = softmax(logits, dim=-1)
    print("Probabilities", probabilities)

    # Get predicted class ID and probability
    predicted_class_id = probabilities.argmax(-1).item()
    predicted_probability = probabilities[0][predicted_class_id].item()

    # Map predicted class ID to class name
    predicted_class = model.config.id2label[predicted_class_id]

    return predicted_class, predicted_probability


# Step 4: Test the Prediction Function
if __name__ == "__main__":
    # Path to the test image
    # Replace with the path to your test image
    image_path = "../public/4.jpg"

    # Predict the class of the image
    predicted_class, predicted_probability = predict_image_class(image_path)

    # Print the result
    print(
        f"Predicted class: {predicted_class} (Probability: {predicted_probability:.2f})")
