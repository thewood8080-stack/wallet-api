// routes/credit.js - ניתובי זיכויים
// כל הנתיבים כאן מוגנים - דורשים טוקן תקין דרך authMiddleware

const express = require('express');
const router = express.Router();
const { addCredit, getCredits, useCredit, deleteCredit } = require('../controllers/credit');
const authMiddleware = require('../middlewares/auth');

// POST /credit/ - הוספת זיכוי חדש
router.post('/', authMiddleware, addCredit);

// GET /credit/ - שליפת כל הזיכויים של המשתמש המחובר
router.get('/', authMiddleware, getCredits);

// PUT /credit/:id - סימון זיכוי כמומש
router.put('/:id', authMiddleware, useCredit);

// DELETE /credit/:id - מחיקת זיכוי
router.delete('/:id', authMiddleware, deleteCredit);

module.exports = router;
