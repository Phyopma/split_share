import Tesseract from "tesseract.js";
import sharp from "sharp";

async function preprocessImage(imagePath) {
  try {
    // Load and process image using sharp
    const processedImage = await sharp(imagePath)
      .grayscale() // Convert to grayscale
      .normalize() // Initial normalization
      .gamma(1.2) // Apply gamma correction to enhance low-intensity details
      .modulate({
        brightness: 1.2, // Increase brightness more for faded text
        saturation: 0.7, // Further reduce saturation
        contrast: 1.3, // Boost contrast
      })
      .normalize() // Final normalization
      .resize(2000, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error("Error preprocessing image:", error);
    throw error;
  }
}

async function extractTextFromImage(imagePath) {
  try {
    // Initialize Tesseract worker with optimized settings
    const worker = await Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    // Configure Tesseract parameters for receipt and invoice processing
    await worker.setParameters({});

    // Preprocess the image before OCR
    const preprocessedImage = await preprocessImage(imagePath);

    // Perform OCR on the preprocessed image
    const {
      data: { text, confidence },
    } = await worker.recognize(preprocessedImage);

    // Clean up worker
    await worker.terminate();

    return {
      text,
      confidence,
    };
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw error;
  }
}

export { extractTextFromImage };
