// credit.js: מודל הזיכוי
// מגדיר את המבנה של מסמך זיכוי (קרדיט חנות) במסד הנתונים

const mongoose = require('mongoose');

// הגדרת הסכמה לזיכוי
const creditSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // מזהה המשתמש שהזיכוי שייך אליו
  storeName:  { type: String, required: true },         // שם החנות, חובה
  category:   { type: String, default: 'אחר' },         // קטגוריה, ברירת מחדל: אחר
  amount:     { type: Number, required: true, min: 0 }, // סכום הזיכוי, חייב להיות 0 ומעלה
  expiryDate: { type: Date },                           // תאריך תפוגה, לא חובה
  isUsed:     { type: Boolean, default: false },        // האם הזיכוי מומש, ברירת מחדל: לא
  image:      { type: String }                          // כתובת תמונה מהענן, לא חובה
}, { timestamps: true }); // מוסיף תאריך יצירה ועדכון אוטומטית

module.exports = mongoose.model('Credit', creditSchema);
