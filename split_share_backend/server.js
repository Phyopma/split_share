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
} = require("./controllers/receiptController");
const {
  register,
  login,
  getCurrentUser,
  refreshToken,
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

// More permissive CORS configuration for development
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Auth Routes
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/user", auth, getCurrentUser);
app.post("/api/auth/refresh-token", auth, refreshToken);

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
app.get("/api/groups/:id/summary", auth, getGroupSummary);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Improved error handling for the server startup
const startServer = async () => {
  try {
    // Test database connection first
    await prisma.$connect();
    console.log("Database connection established successfully");

    // Then start the server
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
