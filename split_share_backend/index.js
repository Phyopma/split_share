import { processReceiptWithOCR } from "./receipt_ocr_processor.js";

var img_path = "./public/image.png";

// Load the TensorFlow.js model

async function main() {
  try {
    const result = await processReceiptWithOCR(img_path);

    console.log(result.ocr_text);
    console.log(JSON.stringify(result.structured_data));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
