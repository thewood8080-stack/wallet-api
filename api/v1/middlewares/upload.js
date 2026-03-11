// upload.js: הגדרת העלאת תמונות לענן Cloudinary
// משתמשים בספריית multer לקבל את הקובץ מהבקשה
// ובספריית cloudinary לשמור אותו בענן

const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// חיבור לענן Cloudinary עם פרטי החשבון מקובץ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// שמירת הקובץ בזיכרון זמני (לא על הדיסק) לפני שליחה לענן
const storage = multer.memoryStorage();

// מגביל את סוג הקובץ לתמונות בלבד
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

// הגדרת multer עם אחסון זמני ומגבלת גודל של 5MB
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// פונקציה שמעלה תמונה לענן ומחזירה את הכתובת (URL)
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'wallet-api' }, // תיקייה בתוך Cloudinary
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url); // מחזיר את כתובת התמונה
      }
    ).end(fileBuffer);
  });
};

module.exports = { upload, uploadToCloudinary };
