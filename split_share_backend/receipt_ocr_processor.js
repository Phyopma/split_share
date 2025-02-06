import Tesseract from "tesseract.js";
import { extractReceiptInfo } from "./receipt_extractor.js";

async function processReceiptWithOCR(imagePath) {
  try {
    // First step: Perform OCR on the image with optimized settings
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    // Configure Tesseract parameters for receipt processing
    await worker.setParameters({
      //   tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK_VERT_TEXT, // Optimized for receipt format
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Use LSTM neural network only
      tessjs_create_pdf: "0", // Disable PDF output for faster processing
      tessjs_create_hocr: "0", // Disable HOCR output
      preserve_interword_spaces: "1", // Preserve spacing between words
      tessedit_char_whitelist:
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,-%:/ ", // Limit to relevant characters
    });

    const {
      data: { text, confidence },
    } = await worker.recognize(imagePath);
    await worker.terminate();

    // Second step: Process the OCR result through our receipt extractor
    const extractedInfo = await extractReceiptInfo(text);

    return {
      ocr_text: text, // Raw OCR text for reference/debugging
      structured_data: extractedInfo, // Structured receipt data
    };
  } catch (error) {
    console.error("Error processing receipt:", error);
    throw error;
  }
}

export { processReceiptWithOCR };
