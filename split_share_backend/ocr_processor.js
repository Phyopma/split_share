import Tesseract from 'tesseract.js';

async function extractTextFromImage(imagePath) {
  try {
    // Initialize Tesseract worker with optimized settings
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    // Configure Tesseract parameters for receipt processing
    await worker.setParameters({
      //      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Use LSTM neural network only
      tessjs_create_pdf: '0', // Disable PDF output for faster processing
      tessjs_create_hocr: '0', // Disable HOCR output
      preserve_interword_spaces: '1', // Preserve spacing between words
      tessedit_char_whitelist:
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,-%:/ ', // Limit to relevant characters
    });

    // Perform OCR on the image
    const {
      data: { text, confidence },
    } = await worker.recognize(imagePath);

    // Clean up worker
    await worker.terminate();

    return {
      text,
      confidence,
    };
  } catch (error) {
    console.error('Error performing OCR:', error);
    throw error;
  }
}

export { extractTextFromImage };
