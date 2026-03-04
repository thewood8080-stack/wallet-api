const express = require('express');
const router = express.Router();
const { addCredit, getCredits, useCredit, deleteCredit } = require('../controllers/credit');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, addCredit);         // הוספת זיכוי
router.get('/', authMiddleware, getCredits);         // שליפת זיכויים
router.put('/:id', authMiddleware, useCredit);       // מימוש זיכוי
router.delete('/:id', authMiddleware, deleteCredit); // מחיקת זיכוי

module.exports = router;