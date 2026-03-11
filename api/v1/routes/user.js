// routes/user.js - ניתובי משתמש
// מגדיר את הנתיבים הקשורים להרשמה והתחברות

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/user');

// POST /user/register - הרשמת משתמש חדש
router.post('/register', register);

// POST /user/login - התחברות משתמש קיים וקבלת טוקן
router.post('/login', login);

module.exports = router;
