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
    console.log(
      "Image size:",
      (req.file.size / (1024 * 1024)).toFixed(2) + "MB"
    );

    // Get receipt data from LLM API
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
    const API_KEY = process.env.OPENROUTER_API_KEY;
    const MODEL =
      process.env.OPENROUTER_MODEL || "llama-3.2-11b-vision-preview";
    const BASE_URL =
      process.env.OPENROUTER_BASE_URL ||
      "https://api.groq.com/openai/v1/chat/completions";

    if (!API_KEY) {
      throw new Error("OpenRouter environment variable is not set");
    }

    console.log(`Using OpenRouter API with model: ${MODEL}`);

    const response = await axios.post(
      BASE_URL,
      {
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "This is a receipt or invoice image. Extract the following information in a structured serializable JSON object: merchantName(String), date(YYYY-MM-DD), location (String), items (array with name(String), quantity(int), unitPrice(float), total(float) for each item), subtotal(float), tax(float), tip (float), and total(float). Make sure all values use proper numeric formats with decimals where applicable.",
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
        temperature: 0.1,
        response_format: { type: "json_object" },
        max_completion_tokens: 1024,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // Parse the response to get the extracted receipt data
    const result = response.data.choices[0].message.content;
    console.log("Successfully extracted receipt data");

    // Clean the result in case it contains markdown code blocks
    const cleanedResult = cleanJsonResponse(result);
    console.log("Cleaned result:", cleanedResult);

    try {
      return JSON.parse(cleanedResult);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError.message);
      console.error("Content that failed to parse:", cleanedResult);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(
      "Error calling LLM API:",
      error.response?.data || error.message
    );

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", JSON.stringify(error.response.headers));
      console.error("Data:", JSON.stringify(error.response.data));
    }

    throw new Error(
      error.response?.data?.error?.message ||
        "Failed to extract receipt data. Please check your LLM API key and model configuration."
    );
  }
}

/**
 * Cleans JSON response from markdown formatting and other potential issues
 */
function cleanJsonResponse(response) {
  // Remove markdown code block indicators like ```json and ```
  let cleaned = response.replace(/```json\s*/g, "").replace(/```\s*$/g, "");

  // Trim any whitespace
  cleaned = cleaned.trim();

  // Handle case where there might be other text before or after the JSON
  const jsonStartIndex = cleaned.indexOf("{");
  const jsonEndIndex = cleaned.lastIndexOf("}");

  if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
    cleaned = cleaned.substring(jsonStartIndex, jsonEndIndex + 1);
  }

  return cleaned;
}

/**
 * Save receipt to database with group association
 */
async function saveReceipt(req, res) {
  try {
    const userId = req.user.id;
    const receiptData = req.body;
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: "Group ID is required",
      });
    }

    // Check if group exists and user is a member
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: true,
      },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const isMember = group.users.some(
      (userGroup) => userGroup.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to add receipts to this group",
      });
    }

    // Parse the date string to a JavaScript Date object
    const receiptDate = new Date(receiptData.date);

    // Create receipt with nested items and convert string values to float
    const receipt = await prisma.receipt.create({
      data: {
        userId,
        groupId,
        merchantName: receiptData.merchantName,
        date: receiptDate,
        subtotal: parseFloat(receiptData.subtotal),
        tax: parseFloat(receiptData.tax),
        tip: receiptData.tip ? parseFloat(receiptData.tip) : null,
        total: parseFloat(receiptData.total),
        status: "INITIAL",
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
    const { groupId } = req.query;

    const whereClause = groupId ? { userId, groupId } : { userId };

    const receipts = await prisma.receipt.findMany({
      where: whereClause,
      include: {
        items: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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
 * Get all receipts for a group
 */
async function getGroupReceipts(req, res) {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;

    // Check if group exists and user is a member
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: true,
      },
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const isMember = group.users.some(
      (userGroup) => userGroup.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this group's receipts",
      });
    }

    const receipts = await prisma.receipt.findMany({
      where: { groupId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            itemSplits: {
              include: {
                item: true,
              },
            },
          },
        },
      },
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
    console.error("Error getting group receipts:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get group receipts",
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

/**
 * Update an existing receipt
 */
async function updateReceipt(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const receiptData = req.body;

    // Check if receipt exists and belongs to user
    const existingReceipt = await prisma.receipt.findFirst({
      where: { id, userId },
    });

    if (!existingReceipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found or doesn't belong to you",
      });
    }

    // Parse the date string to a JavaScript Date object
    const receiptDate = new Date(receiptData.date);

    // First update the receipt
    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: {
        merchantName: receiptData.merchantName,
        date: receiptDate,
        subtotal: parseFloat(receiptData.subtotal),
        tax: parseFloat(receiptData.tax),
        tip: receiptData.tip ? parseFloat(receiptData.tip) : null,
        total: parseFloat(receiptData.total),
      },
    });

    // Delete existing items to replace with new ones
    await prisma.item.deleteMany({
      where: { receiptId: id },
    });

    // Create new items
    const itemsData = receiptData.items.map((item) => ({
      receiptId: id,
      name: item.name,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      total: parseFloat(item.total),
    }));

    await prisma.item.createMany({
      data: itemsData,
    });

    // Get updated receipt with items
    const completeReceipt = await prisma.receipt.findUnique({
      where: { id },
      include: { items: true },
    });

    // Format the date for response
    const formattedReceipt = {
      ...completeReceipt,
      date: completeReceipt.date.toISOString(),
    };

    res.status(200).json({
      success: true,
      data: formattedReceipt,
    });
  } catch (error) {
    console.error("Error updating receipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update receipt",
    });
  }
}

/**
 * Split a receipt by percentage of the total
 */
async function splitReceiptByPercentage(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { splits } = req.body;

    // Validate input
    if (!Array.isArray(splits) || splits.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Splits data is required and must be an array",
      });
    }

    // Validate that percentages sum to 100
    const totalPercentage = splits.reduce(
      (sum, split) => sum + split.percentage,
      0
    );
    if (Math.abs(totalPercentage - 100) > 0.01) {
      // Allow a small rounding error
      return res.status(400).json({
        success: false,
        message: "Total percentage must equal 100%",
      });
    }

    // Check if receipt exists
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
        group: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if user is the owner
    if (receipt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the receipt owner can split the receipt",
      });
    }

    // Verify all users in splits are members of the group
    const groupUserIds = receipt.group.users.map((ug) => ug.userId);
    const allUsersInGroup = splits.every((split) =>
      groupUserIds.includes(split.userId)
    );

    if (!allUsersInGroup) {
      return res.status(400).json({
        success: false,
        message: "All users must be members of the group",
      });
    }

    // Delete any existing splits for this receipt
    await prisma.split.deleteMany({
      where: { receiptId: id },
    });

    // Create new splits
    const splitsData = [];
    for (const split of splits) {
      const amount = (receipt.total * split.percentage) / 100;
      splitsData.push({
        receiptId: id,
        userId: split.userId,
        amount: parseFloat(amount.toFixed(2)),
        splitType: "PERCENTAGE_TOTAL",
        percentage: split.percentage,
      });
    }

    await prisma.split.createMany({
      data: splitsData,
    });

    // Update receipt status
    await prisma.receipt.update({
      where: { id },
      data: { status: "ASSIGNED_SPLIT" },
    });

    // Get updated receipt with splits
    const updatedReceipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedReceipt,
    });
  } catch (error) {
    console.error("Error splitting receipt:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to split receipt",
    });
  }
}

/**
 * Split receipt by percentage per item
 */
async function splitReceiptByItemPercentage(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { itemSplits } = req.body;

    // Validate input
    if (!Array.isArray(itemSplits) || itemSplits.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Item splits data is required and must be an array",
      });
    }

    // Check if receipt exists
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
        group: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if user is the owner
    if (receipt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the receipt owner can split the receipt",
      });
    }

    // Group users check
    const groupUserIds = receipt.group.users.map((ug) => ug.userId);

    // Validate that each item's percentages sum to 100% and users are in the group
    for (const itemSplit of itemSplits) {
      const totalPercentage = itemSplit.userPercentages.reduce(
        (sum, up) => sum + up.percentage,
        0
      );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Total percentage for item ${itemSplit.itemId} must equal 100%`,
        });
      }

      // Check if all users are in the group
      const allUsersInGroup = itemSplit.userPercentages.every((up) =>
        groupUserIds.includes(up.userId)
      );

      if (!allUsersInGroup) {
        return res.status(400).json({
          success: false,
          message: "All users must be members of the group",
        });
      }
    }

    // Delete any existing splits for this receipt
    await prisma.split.deleteMany({
      where: { receiptId: id },
    });

    // Create splits and itemSplits
    const userSplitTotals = {};

    // Initialize user split totals
    groupUserIds.forEach((userId) => {
      userSplitTotals[userId] = 0;
    });

    // Create in transaction to ensure consistency
    await prisma.$transaction(async (prisma) => {
      // For each item split
      for (const itemSplit of itemSplits) {
        const item = receipt.items.find((i) => i.id === itemSplit.itemId);

        if (!item) {
          throw new Error(
            `Item with id ${itemSplit.itemId} not found in receipt`
          );
        }

        for (const userPercentage of itemSplit.userPercentages) {
          const amount = (item.total * userPercentage.percentage) / 100;
          userSplitTotals[userPercentage.userId] += amount;
        }
      }

      // Create user splits
      for (const userId of Object.keys(userSplitTotals)) {
        if (userSplitTotals[userId] > 0) {
          const split = await prisma.split.create({
            data: {
              receiptId: id,
              userId: userId,
              amount: parseFloat(userSplitTotals[userId].toFixed(2)),
              splitType: "PERCENTAGE_PER_ITEM",
            },
          });

          // Create itemSplits for this user
          for (const itemSplit of itemSplits) {
            const userPercentage = itemSplit.userPercentages.find(
              (up) => up.userId === userId && up.percentage > 0
            );

            if (userPercentage) {
              const item = receipt.items.find((i) => i.id === itemSplit.itemId);
              const amount = (item.total * userPercentage.percentage) / 100;

              await prisma.itemSplit.create({
                data: {
                  splitId: split.id,
                  itemId: itemSplit.itemId,
                  percentage: userPercentage.percentage,
                  amount: parseFloat(amount.toFixed(2)),
                },
              });
            }
          }
        }
      }

      // Update receipt status
      await prisma.receipt.update({
        where: { id },
        data: { status: "ASSIGNED_SPLIT" },
      });
    });

    // Get updated receipt with splits
    const updatedReceipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            itemSplits: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedReceipt,
    });
  } catch (error) {
    console.error("Error splitting receipt by item percentage:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to split receipt by item percentage",
    });
  }
}

/**
 * Split receipt by item assignment
 */
async function splitReceiptByItems(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { userItems } = req.body;

    // Validate input
    if (!Array.isArray(userItems) || userItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User items data is required and must be an array",
      });
    }

    // Check if receipt exists
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
        group: {
          include: {
            users: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Check if user is the owner
    if (receipt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the receipt owner can split the receipt",
      });
    }

    // Group users check
    const groupUserIds = receipt.group.users.map((ug) => ug.userId);

    // Check if all users are in the group
    const userIds = userItems.map((ui) => ui.userId);
    const allUsersInGroup = userIds.every((userId) =>
      groupUserIds.includes(userId)
    );

    if (!allUsersInGroup) {
      return res.status(400).json({
        success: false,
        message: "All users must be members of the group",
      });
    }

    // Build a map of which items are assigned to which users
    const itemAssignments = {};
    receipt.items.forEach((item) => {
      itemAssignments[item.id] = [];
    });

    // Validate all items exist in receipt
    for (const userItem of userItems) {
      for (const itemId of userItem.itemIds) {
        const item = receipt.items.find((i) => i.id === itemId);
        if (!item) {
          return res.status(400).json({
            success: false,
            message: `Item with id ${itemId} not found in receipt`,
          });
        }
        itemAssignments[itemId].push(userItem.userId);
      }
    }

    // Ensure all items are assigned to at least one user
    const unassignedItems = Object.entries(itemAssignments)
      .filter(([_, users]) => users.length === 0)
      .map(([itemId, _]) => itemId);

    if (unassignedItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some items are not assigned to any user: ${unassignedItems.join(
          ", "
        )}`,
      });
    }

    // Delete any existing splits for this receipt
    await prisma.split.deleteMany({
      where: { receiptId: id },
    });

    // Create splits and itemSplits
    const userSplitTotals = {};

    // Initialize user split totals
    groupUserIds.forEach((userId) => {
      userSplitTotals[userId] = 0;
    });

    // Create in transaction to ensure consistency
    await prisma.$transaction(async (prisma) => {
      // For each item
      for (const item of receipt.items) {
        const userCount = itemAssignments[item.id].length;
        if (userCount > 0) {
          const amountPerUser = item.total / userCount;

          // Add to user totals
          itemAssignments[item.id].forEach((userId) => {
            if (!userSplitTotals[userId]) userSplitTotals[userId] = 0;
            userSplitTotals[userId] += amountPerUser;
          });
        }
      }

      // Create user splits
      for (const userId of Object.keys(userSplitTotals)) {
        if (userSplitTotals[userId] > 0) {
          const split = await prisma.split.create({
            data: {
              receiptId: id,
              userId: userId,
              amount: parseFloat(userSplitTotals[userId].toFixed(2)),
              splitType: "ITEM_BASED",
            },
          });

          // Create itemSplits for this user
          for (const item of receipt.items) {
            if (itemAssignments[item.id].includes(userId)) {
              const userCount = itemAssignments[item.id].length;
              const amount = item.total / userCount;

              await prisma.itemSplit.create({
                data: {
                  splitId: split.id,
                  itemId: item.id,
                  amount: parseFloat(amount.toFixed(2)),
                },
              });
            }
          }
        }
      }

      // Update receipt status
      await prisma.receipt.update({
        where: { id },
        data: { status: "ASSIGNED_SPLIT" },
      });
    });

    // Get updated receipt with splits
    const updatedReceipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: true,
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            itemSplits: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedReceipt,
    });
  } catch (error) {
    console.error("Error splitting receipt by items:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to split receipt by items",
    });
  }
}

/**
 * Mark receipt as settled
 */
async function markReceiptSettled(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if receipt exists and belongs to user
    const receipt = await prisma.receipt.findUnique({
      where: { id },
    });

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    if (receipt.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the receipt owner can mark it as settled",
      });
    }

    if (receipt.status !== "ASSIGNED_SPLIT") {
      return res.status(400).json({
        success: false,
        message: "Only receipts with assigned splits can be marked as settled",
      });
    }

    // Mark all splits as paid
    await prisma.split.updateMany({
      where: { receiptId: id },
      data: { isPaid: true },
    });

    // Update receipt status
    const updatedReceipt = await prisma.receipt.update({
      where: { id },
      data: { status: "SETTLED" },
      include: {
        items: true,
        splits: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: updatedReceipt,
    });
  } catch (error) {
    console.error("Error marking receipt as settled:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark receipt as settled",
    });
  }
}

// Export the functions
module.exports = {
  processReceiptImage,
  saveReceipt,
  updateReceipt,
  getUserReceipts,
  getGroupReceipts,
  deleteReceipt,
  splitReceiptByPercentage,
  splitReceiptByItemPercentage,
  splitReceiptByItems,
  markReceiptSettled,
};
