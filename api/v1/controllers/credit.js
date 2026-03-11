// controllers/credit.js: לוגיקת זיכויים
// מכיל את הפונקציות לניהול זיכויי חנות: הוספה, שליפה, מימוש ומחיקה

const Credit = require('../models/credit');
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../middlewares/upload');

// addCredit: הוספת זיכוי חדש
const addCredit = async (req, res) => {
  try {
    // קבלת הנתונים מגוף הבקשה
    const { storeName, amount, expiryDate } = req.body;

    // ניקוי שם החנות מרווחים מיותרים
    const trimmedStore = typeof storeName === 'string' ? storeName.trim() : '';

    // המרת הסכום למספר
    const numAmount = Number(amount);

    // בדיקת תאריך תפוגה, אם נשלח ולא תקין מאפסים אותו
    let validDate = expiryDate ? new Date(expiryDate) : null;
    if (validDate && isNaN(validDate.getTime())) validDate = null;

    // בדיקות תקינות
    if (!trimmedStore || trimmedStore.length < 1) {
      return res.status(400).json({ msg: 'Store name is required' });
    }
    if (typeof numAmount !== 'number' || isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    // אם נשלחה תמונה, מעלים אותה לענן ושומרים את הכתובת
    let imageUrl = undefined;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    // יצירת הזיכוי ושמירה במסד הנתונים
    const credit = new Credit({
      userId: req.user.userId,   // לוקחים את מזהה המשתמש מהטוקן
      storeName: trimmedStore,
      amount: numAmount,
      expiryDate: validDate || undefined,
      image: imageUrl            // כתובת התמונה מהענן (אם הועלתה)
    });
    await credit.save();

    res.status(201).json({ msg: 'Credit added successfully', credit });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to add credit' });
  }
};

// getCredits: שליפת כל הזיכויים של המשתמש המחובר
const getCredits = async (req, res) => {
  try {
    // מחפשים רק זיכויים שה userId שלהם תואם למשתמש הנוכחי
    const credits = await Credit.find({ userId: req.user.userId });
    res.status(200).json(credits);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch credits' });
  }
};

// useCredit: סימון זיכוי כמומש
const useCredit = async (req, res) => {
  try {
    const { id } = req.params;

    // בדיקה שה id הוא ObjectId תקין של MongoDB
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }

    // עדכון הזיכוי, רק אם הוא שייך למשתמש הנוכחי
    const credit = await Credit.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isUsed: true },
      { new: true } // מחזיר את המסמך אחרי העדכון
    );

    if (!credit) return res.status(404).json({ msg: 'Credit not found' });

    res.status(200).json({ msg: 'Credit marked as used', credit });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update credit' });
  }
};

// deleteCredit: מחיקת זיכוי
const deleteCredit = async (req, res) => {
  try {
    const { id } = req.params;

    // בדיקה שה id תקין
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }

    // מחיקת הזיכוי, רק אם הוא שייך למשתמש הנוכחי
    const credit = await Credit.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!credit) return res.status(404).json({ msg: 'Credit not found' });

    res.status(200).json({ msg: 'Credit deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete credit' });
  }
};

module.exports = { addCredit, getCredits, useCredit, deleteCredit };
