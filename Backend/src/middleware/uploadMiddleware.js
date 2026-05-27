import multer from "multer";
import path from "path";
import fs from "fs";

// 1. सुनिश्चित करें कि बैकएंड में 'uploads' फ़ोल्डर मौजूद है, यदि नहीं है तो यह कोड अपने आप उसे बना देगा
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. memoryStorage को बदलकर diskStorage में कन्वर्ट किया गया है
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // यूनिक नाम (Date.now() + random number) ताकि कोई भी इमेज आपस में ओवरराइट न हो
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname); // एक्सटेंशन जैसे .jpg, .png
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  }
});

// WebP भी allowed
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WebP, and PDF are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Multer errors properly handle karne wala wrapper
export const uploadMiddleware = (req, res, next) => {
  upload.fields([
    { name: "warrantyCard",   maxCount: 1 },
    { name: "invoice",        maxCount: 1 },
    { name: "productImage",   maxCount: 1 },
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File 5MB se badi nahi honi chahiye" });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export default upload;