const { GoogleGenerativeAI } = require('@google/generative-ai');
const Credit = require('../models/credit');
const Coupon = require('../models/coupon');

const analyzeImage = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string' || imageBase64.length < 100) {
      return res.status(400).json({ msg: 'Invalid image data' });
    }
    if (!process.env.GEMINI_KEY) {
      return res.status(500).json({ msg: 'AI service unavailable' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      },
      `אתה מנתח חשבוניות. חלץ מהתמונה את הפרטים הבאים והחזר JSON בלבד:
      {
        "storeName": "שם החנות",
        "amount": 0,
        "expiryDate": "YYYY-MM-DD",
        "category": "קטגוריה"
      }
      קטגוריות אפשריות: ביגוד, מזון, פארמה, אלקטרוניקה, ספורט, אחר`
    ]);

    if (!result?.response?.text) {
      return res.status(500).json({ msg: 'Failed to analyze image' });
    }

    const text = typeof result.response.text === 'function' ? result.response.text() : result.response.text;
    const clean = text.replace(/```json|```/g, '').trim();
    let data;
    try {
      data = JSON.parse(clean);
    } catch {
      return res.status(500).json({ msg: 'Failed to parse analysis result' });
    }

    res.status(200).json(data);
  } catch (err) {
    const msg = String(err?.message || '');
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
      return res.status(500).json({ msg: 'חרגת ממגבלת השימוש. נסה שוב מאוחר יותר' });
    }
    if (msg.includes('403') || msg.includes('API key') || msg.includes('invalid')) {
      return res.status(500).json({ msg: 'מפתח API לא תקין' });
    }
    res.status(500).json({ msg: 'Image analysis failed' });
  }
};

const askAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length < 2) {
      return res.status(400).json({ msg: 'Invalid question' });
    }
    if (!process.env.GEMINI_KEY) {
      return res.status(500).json({ msg: 'AI service unavailable' });
    }

    const [credits, coupons] = await Promise.all([
      Credit.find({ userId: req.user.userId }),
      Coupon.find({ userId: req.user.userId })
    ]);

    const context = JSON.stringify({
      credits: credits.map(c => ({ storeName: c.storeName, amount: c.amount, expiryDate: c.expiryDate, isUsed: c.isUsed })),
      coupons: coupons.map(c => ({ description: c.description, discount: c.discount, expiryDate: c.expiryDate, isUsed: c.isUsed }))
    });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `המשתמש שואל: "${question.trim()}"\n\nהנתונים שלו:\n${context}\n\nענה בעברית בקצרה על סמך הנתונים. אם אין נתונים רלוונטיים, אמור זאת.`
    );

    let text = 'לא הצלחתי לענות.';
    if (result?.response) {
      try {
        text = typeof result.response.text === 'function' ? result.response.text() : (result.response.text || text);
      } catch (e) {
        const blockReason = result.response?.promptFeedback?.blockReason || result.response?.candidates?.[0]?.finishReason;
        if (blockReason) text = 'התשובה נחסמה. נסה לשאול שאלה אחרת.';
      }
    }
    res.status(200).json({ answer: text });
  } catch (err) {
    const msg = String(err?.message || '');
    if (msg.includes('404') || msg.includes('model') || msg.includes('not found')) {
      return res.status(500).json({ msg: 'מודל AI לא זמין' });
    }
    if (msg.includes('403') || msg.includes('API key') || msg.includes('invalid') || msg.includes('API_KEY_INVALID')) {
      return res.status(500).json({ msg: 'מפתח API לא תקין' });
    }
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
      return res.status(500).json({ msg: 'חרגת ממגבלת השימוש. נסה שוב מאוחר יותר' });
    }
    res.status(500).json({ msg: 'Failed to get answer' });
  }
};

module.exports = { analyzeImage, askAI };
