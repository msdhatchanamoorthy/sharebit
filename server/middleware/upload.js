const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (optional - for production use)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Create uploads directory if it doesn't exist (for local storage fallback)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage - use memory storage for Cloudinary
const storage = multer.memoryStorage();

// File filter - only allow image uploads
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Function to upload file to Cloudinary or save locally
async function uploadToCloudinary(fileBuffer, fileName) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback: save locally if Cloudinary not configured
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = 'food-' + uniqueSuffix + path.extname(fileName);
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, fileBuffer);
    return `/uploads/${filename}`;
  }

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'sharebit/foods',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
}

// Function to upload file to Cloudinary or save locally
async function uploadToCloudinary(fileBuffer, fileName) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback: save locally if Cloudinary not configured
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = 'food-' + uniqueSuffix + path.extname(fileName);
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, fileBuffer);
    return `/uploads/${filename}`;
  }

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'sharebit/foods',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
}

// Function to upload profile photo to Cloudinary or save locally
async function uploadProfilePhoto(fileBuffer, fileName) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback: save locally if Cloudinary not configured
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = 'profile-' + uniqueSuffix + path.extname(fileName);
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, fileBuffer);
    return `/uploads/${filename}`;
  }

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'sharebit/profiles',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
}

module.exports = { upload, uploadToCloudinary, uploadProfilePhoto };
