require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const prisma = require("./prisma/dbClient");
const {
  processReceiptImage,
  saveReceipt,
  getUserReceipts,
  deleteReceipt,
  updateReceipt,
  getGroupReceipts,
  splitReceiptByPercentage,
  splitReceiptByItemPercentage,
  splitReceiptByItems,
  markReceiptSettled,
} = require("./controllers/receiptController");
const {
  register,
  login,
  getCurrentUser,
} = require("./controllers/authController");
const {
  createGroup,
  getUserGroups,
  getGroupById,
  inviteUserToGroup,
  removeUserFromGroup,
  deleteGroup,
  getGroupSummary,
} = require("./controllers/groupController");
const auth = require("./middleware/auth");
const { uploadAndResize } = require("./middleware/upload");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Auth Routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/user", auth, getCurrentUser);

// Receipt Routes
app.post(
  "/api/receipts/upload",
  auth,
  uploadAndResize("image"),
  processReceiptImage
);
app.post("/api/receipts", auth, saveReceipt);
app.put("/api/receipts/:id", auth, updateReceipt);
app.get("/api/receipts", auth, getUserReceipts);
app.delete("/api/receipts/:id", auth, deleteReceipt);

// Group Routes
app.post("/api/groups", auth, createGroup);
app.get("/api/groups", auth, getUserGroups);
app.get("/api/groups/:id", auth, getGroupById);
app.post("/api/groups/:id/invite", auth, inviteUserToGroup);
app.delete("/api/groups/:groupId/users/:userId", auth, removeUserFromGroup);
app.delete("/api/groups/:id", auth, deleteGroup);

// Group Receipts Routes
app.get("/api/groups/:groupId/receipts", auth, getGroupReceipts);
app.get("/api/groups/:id/summary", auth, getGroupSummary);

// Receipt Splitting Routes
app.post("/api/receipts/:id/split/percentage", auth, splitReceiptByPercentage);
app.post(
  "/api/receipts/:id/split/item-percentage",
  auth,
  splitReceiptByItemPercentage
);
app.post("/api/receipts/:id/split/items", auth, splitReceiptByItems);
app.post("/api/receipts/:id/settle", auth, markReceiptSettled);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong on the server",
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Test database connection
  prisma
    .$connect()
    .then(() => {
      console.log("Database connection established successfully");
    })
    .catch((error) => {
      console.error("Error connecting to database:", error);
      process.exit(1);
    });
});

// Handle graceful shutdown and close Prisma client
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
