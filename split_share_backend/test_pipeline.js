import { processReceiptWithOCR } from "./receipt_ocr_processor.js";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

async function classifyImage(imagePath) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", [
      "./py_lib/receipt_processor.py",
      imagePath,
    ]);

    let result = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}`));
        return;
      }

      try {
        const parsedResult = JSON.parse(result);
        resolve({
          isReceipt: parsedResult.is_receipt,
          prediction: parsedResult.document_type,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });
  });
}

async function testPipeline() {
  const testImagesDir = "./public";

  try {
    const files = await fs.readdir(testImagesDir);
    const imageFiles = files.filter((file) =>
      [".jpg", ".jpeg", ".png"].includes(path.extname(file).toLowerCase())
    );

    console.log("=== Starting Pipeline Test ===");
    console.log(`Found ${imageFiles.length} test images\n`);

    for (const imageFile of imageFiles) {
      const imagePath = path.join(testImagesDir, imageFile);
      console.log(`Testing image: ${imageFile}`);
      console.log("-------------------");

      try {
        // First step: Classify the image
        console.log("Classifying image...");
        const { isReceipt, prediction } = await classifyImage(imagePath);
        console.log(`Classification result: ${prediction}`);

        if (!isReceipt) {
          console.log("Image is not a receipt, skipping OCR processing\n");
          continue;
        }

        // Second step: Process receipt with OCR
        console.log("Processing receipt with OCR...");
        const startTime = Date.now();
        const result = await processReceiptWithOCR(imagePath);
        const endTime = Date.now();

        console.log("OCR Confidence:", result.confidence);
        console.log(
          "Processing Time:",
          (endTime - startTime) / 1000,
          "seconds"
        );
        console.log("\nExtracted Data:");
        console.log(JSON.stringify(result.structured_data, null, 2));
        console.log("\n");
      } catch (error) {
        console.error(`Error processing ${imageFile}:`, error);
      }
    }

    console.log("=== Pipeline Test Complete ===");
  } catch (error) {
    console.error("Test execution error:", error);
  }
}

// Run the test
testPipeline();
