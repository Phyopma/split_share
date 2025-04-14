const jwt = require("jsonwebtoken");
const prisma = require("../prisma/dbClient");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // Check token expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token format",
        });
      }
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired",
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = auth;
