// controllers/user.js - לוגיקת משתמשים
// מכיל את הפונקציות register ו-login

const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ביטוי רגולרי לבדיקת תקינות אימייל
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// register - הרשמת משתמש חדש
const register = async (req, res) => {
  try {
    // קבלת הנתונים מגוף הבקשה
    const { name, email, password } = req.body;

    // ניקוי הקלטים מרווחים מיותרים
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedPassword = typeof password === 'string' ? password : '';

    // בדיקת תקינות הקלטים
    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ msg: 'Invalid name' });
    }
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ msg: 'Invalid email' });
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    // הצפנת הסיסמה לפני השמירה (10 = רמת החוזק של ההצפנה)
    const hashPass = await bcrypt.hash(trimmedPassword, 10);

    // יצירת משתמש חדש ושמירה במסד הנתונים
    const user = new User({ name: trimmedName, email: trimmedEmail, password: hashPass });
    await user.save();

    res.status(201).json({ msg: 'User registered successfully', userId: user._id });
  } catch (err) {
    // קוד 11000 מ-MongoDB = אימייל כבר קיים
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already exists' });
    }
    res.status(500).json({ msg: 'Registration failed' });
  }
};

// login - התחברות משתמש קיים
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ניקוי הקלטים
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedPassword = typeof password === 'string' ? password : '';

    // בדיקת תקינות הקלטים
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail) || !trimmedPassword) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // חיפוש המשתמש במסד הנתונים לפי אימייל
    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // השוואת הסיסמה שהוזנה מול הסיסמה המוצפנת במסד
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    // בדיקה שמפתח ה-JWT מוגדר
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: 'Server error' });
    }

    // יצירת טוקן JWT שתקף ליום אחד
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ msg: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ msg: 'Login failed' });
  }
};

module.exports = { register, login };
