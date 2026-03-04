const express = require('express');
const router = express.Router();
const { analyzeImage, askAI } = require('../controllers/ai');
const authMiddleware = require('../middlewares/auth');

router.post('/analyze', authMiddleware, analyzeImage);
router.post('/ask', authMiddleware, askAI);

module.exports = router;