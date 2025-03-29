const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer
const uploadConfig = multer({
  storage: storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Increase limit to 10MB to handle before resizing
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Create a multer middleware that processes the upload and resizes if needed
const uploadAndResize = (fieldName) => {
  return function (req, res, next) {
    uploadConfig.single(fieldName)(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Error uploading file",
        });
      }

      if (!req.file) {
        return next();
      }

      try {
        // Get file stats to check size
        const stats = fs.statSync(req.file.path);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        // If file is larger than 5MB, resize it
        if (fileSizeInMB > 5) {
          console.log(`Image is ${fileSizeInMB.toFixed(2)}MB, resizing...`);

          // Get image info
          const imageInfo = await sharp(req.file.path).metadata();

          // Calculate new dimensions while maintaining aspect ratio
          // Target ~4MB which is safely under our 5MB limit
          const scaleFactor = Math.sqrt((4 * 1024 * 1024) / fileSizeInBytes);
          const newWidth = Math.floor(imageInfo.width * scaleFactor);

          // Resize the image and save it, overwriting the original
          await sharp(req.file.path)
            .resize(newWidth) // Width resized, height maintained proportionally
            .jpeg({ quality: 85 }) // Slightly reduce quality for JPEG
            .toFile(req.file.path + "_resized");

          // Replace original with resized version
          fs.unlinkSync(req.file.path);
          fs.renameSync(req.file.path + "_resized", req.file.path);

          // Update file size in the request object
          const newStats = fs.statSync(req.file.path);
          req.file.size = newStats.size;

          console.log(
            `Resized to ${(newStats.size / (1024 * 1024)).toFixed(2)}MB`
          );
        }

        next();
      } catch (error) {
        console.error("Error resizing image:", error);
        return res.status(500).json({
          success: false,
          message: "Error processing image",
        });
      }
    });
  };
};

module.exports = {
  uploadAndResize,
};
