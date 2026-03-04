const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/user');

router.post('/register', register); // הרשמה
router.post('/login', login);       // התחברות

module.exports = router;
