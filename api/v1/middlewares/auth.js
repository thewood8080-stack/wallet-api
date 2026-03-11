// auth.js - Middleware לאימות משתמש
// בודק שכל בקשה מגיעה עם טוקן JWT תקין לפני שהיא מגיעה ל-Controller

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // שליפת הכותרת Authorization מהבקשה (למשל: "Bearer eyJhbGci...")
    const authString = req.headers.authorization;

    // אם אין כותרת - הבקשה לא מאומתת
    if (!authString || typeof authString !== 'string') {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // הטוקן נמצא אחרי המילה "Bearer " - לוקחים את החלק השני
    const token = authString.split(' ')[1];
    if (!token) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    // בדיקה שמפתח ה-JWT מוגדר בסביבה
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ msg: 'Server configuration error' });
    }

    // פענוח הטוקן - אם הוא לא תקין, תיזרק שגיאה ונגיע ל-catch
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // שמירת פרטי המשתמש על אובייקט הבקשה לשימוש ב-Controller
    req.user = decoded;

    // המשך לפונקציה הבאה (ה-Controller)
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
