import cv2
import numpy as np
import pytesseract
from PIL import Image
import os
import sys
import matplotlib.pyplot as plt


def preprocess_image(image_path, show_steps=True):
    """Preprocess the image optimized for low ink receipts."""
    # Read the image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Could not read image at {image_path}")

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply bilateral filter to reduce noise while preserving edges
    denoised = cv2.bilateralFilter(gray, 9, 75, 75)

    # Enhance contrast using CLAHE with stronger parameters for low ink
    clahe = cv2.createCLAHE(clipLimit=3.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # Apply sharpening to improve text clarity
    kernel = np.array([[-1, -1, -1],
                      [-1, 9, -1],
                      [-1, -1, -1]])
    sharpened = cv2.filter2D(enhanced, -1, kernel)

    if show_steps:
        # Create a figure with subplots
        plt.figure(figsize=(15, 5))

        # Original image
        plt.subplot(151)
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        plt.title('Original')
        plt.axis('off')

        # Denoised
        plt.subplot(152)
        plt.imshow(denoised, cmap='gray')
        plt.title('Denoised')
        plt.axis('off')

        # Enhanced
        plt.subplot(153)
        plt.imshow(enhanced, cmap='gray')
        plt.title('Enhanced')
        plt.axis('off')

        # Sharpened
        plt.subplot(154)
        plt.imshow(sharpened, cmap='gray')
        plt.title('Sharpened')
        plt.axis('off')

        plt.tight_layout()
        plt.show()

    # return sharpened
    return image


def extract_text(image_path):
    """Extract text from image while preserving structure and layout."""
    try:
        # Preprocess the image
        # processed_image = preprocess_image(image_path)
        processed_image = preprocess_image(image_path, False)

        # Configure Tesseract parameters optimized for receipt OCR
        custom_config = r'--psm 6 --oem 3  -c preserve_interword_spaces=1 pdftotext '

        # Convert processed image to PIL format for Tesseract
        pil_image = Image.fromarray(processed_image)

        # Perform OCR with optimized configuration
        text = pytesseract.image_to_string(
            pil_image,
            config=custom_config,
            lang='eng'
        )

        # Clean up the extracted text
        text = '\n'.join(line.strip()
                         for line in text.split('\n') if line.strip())

        return text

    except Exception as e:
        raise Exception(f"Error in OCR processing: {str(e)}")


def process_receipt(image_path="../public/1.jpg"):
    """Main function to process receipt images."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image file not found: {image_path}")

    try:
        # Step 1: Extract raw text using OCR
        raw_text = extract_text(image_path)

        # Step 2: Process and structure the text using post_processor
        from post_processor import clean_text
        structured_output = clean_text(raw_text)

        return structured_output
    except Exception as e:
        raise Exception(f"Failed to process receipt: {str(e)}")


if __name__ == "__main__":
    image_path = sys.argv[1]
    result = process_receipt(image_path)
    print(result)
