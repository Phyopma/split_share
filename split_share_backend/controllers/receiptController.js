const fs = require("fs");
const path = require("path");
const axios = require("axios");
const prisma = require("../prisma/dbClient");

/**
 * Process a receipt image using Groq Vision API and return structured data
 */
async function processReceiptImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Read the uploaded file
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    console.log("Processing image:", req.file.originalname);

    // Get receipt data from Groq API
    const receiptData = await extractReceiptData(base64Image);

    // Clean up the uploaded file
    fs.unlinkSync(imagePath);

    return res.status(200).json({
      success: true,
      data: receiptData,
    });
  } catch (error) {
    console.error("Error processing receipt:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process receipt image",
    });
  }
}

/**
 * Extract structured data from receipt image using Groq API
 */
async function extractReceiptData(base64Image) {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const MODEL = process.env.MODEL || "llama-3.2-11b-vision-preview";

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is not set");
    }

    console.log(`Using Groq API with model: ${MODEL}`);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "This is a receipt or invoice image. Extract the following information in a structured JSON format: merchantName, date, location, items (array with name, quantity, unitPrice, total for each item), subtotal, tax, tip (if available), and total. Make sure all values use proper numeric formats with decimals where applicable. For each item, use 'name' for the item description, not 'description'.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.2,
        max_completion_tokens: 1024,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    // Parse the response to get the extracted receipt data
    const result = response.data.choices[0].message.content;
    console.log("Successfully extracted receipt data");
    return JSON.parse(result);
  } catch (error) {
    console.error(
      "Error calling Groq API:",
      error.response?.data || error.message
    );

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", JSON.stringify(error.response.headers));
      console.error("Data:", JSON.stringify(error.response.data));
    }

    throw new Error(
      error.response?.data?.error?.message ||
        "Failed to extract receipt data. Please check your Groq API key and model configuration."
    );
  }
}

/**
 * Save receipt to database
 */
async function saveReceipt(req, res) {
  try {
    const userId = req.user.id;
    const receiptData = req.body;

    // Parse the date string to a JavaScript Date object
    const receiptDate = new Date(receiptData.date);

    // Create receipt with nested items and convert string values to float
    const receipt = await prisma.receipt.create({
      data: {
        userId,
        merchantName: receiptData.merchantName,
        date: receiptDate,
        subtotal: parseFloat(receiptData.subtotal),
        tax: parseFloat(receiptData.tax),
        tip: receiptData.tip ? parseFloat(receiptData.tip) : null,
        total: parseFloat(receiptData.total),
        items: {
          create: receiptData.items.map((item) => ({
            name: item.name,
            quantity: parseFloat(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            total: parseFloat(item.total),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Format the date for response
    const formattedReceipt = {
      ...receipt,
      date: receipt.date.toISOString(),
    };

    res.status(201).json({
      success: true,
      data: formattedReceipt,
    });
  } catch (error) {
    console.error("Error saving receipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to save receipt",
    });
  }
}

/**
 * Get all receipts for a user
 */
async function getUserReceipts(req, res) {
  try {
    const userId = req.user.id;

    const receipts = await prisma.receipt.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    // Format the dates for response
    const formattedReceipts = receipts.map((receipt) => ({
      ...receipt,
      date: receipt.date.toISOString(),
    }));

    res.status(200).json({
      success: true,
      data: formattedReceipts,
    });
  } catch (error) {
    console.error("Error getting receipts:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get receipts",
    });
  }
}

/**
 * Delete a receipt
 */
async function deleteReceipt(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if receipt exists and belongs to user
    const receipt = await prisma.receipt.findFirst({
      where: { id, userId },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found or doesn't belong to you",
      });
    }

    // Delete receipt (cascade will delete items because of the schema relationship)
    await prisma.receipt.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Receipt deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting receipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete receipt",
    });
  }
}

module.exports = {
  processReceiptImage,
  saveReceipt,
  getUserReceipts,
  deleteReceipt,
};
