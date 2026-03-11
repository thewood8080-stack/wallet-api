// user.js - מודל המשתמש
// מגדיר את המבנה של מסמך משתמש במסד הנתונים MongoDB

const mongoose = require('mongoose');

// הגדרת הסכמה - כלומר אילו שדות יש למשתמש ומה הסוג שלהם
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },           // שם המשתמש - חובה
  email:    { type: String, required: true, unique: true }, // אימייל - חובה וייחודי
  password: { type: String, required: true }            // סיסמה מוצפנת - חובה
}, { timestamps: true }); // timestamps מוסיף אוטומטית createdAt ו-updatedAt

// יצוא המודל כדי שניתן יהיה להשתמש בו בקבצים אחרים
module.exports = mongoose.model('User', userSchema);
