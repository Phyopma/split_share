import { processReceiptWithOCR } from "./receipt_ocr_processor.js";

var img_path = "./public/1000_F_182011806_mxcDzt9ckBYbGpxAne8o73DbyDHpXOe9.jpg";

async function main() {
  try {
    const result = await processReceiptWithOCR(img_path);

    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
