// טעינת משתני סביבה וייבוא חבילות
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// הגדרת Rate Limiting - הגבלת בקשות
// מגביל כל משתמש ל-100 בקשות בכל 15 דקות
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { msg: 'Too many requests' }
});

// מגביל נתיבי אימות ל-10 ניסיונות בלבד בכל 15 דקות
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { msg: 'Too many attempts' }
});

// הגדרת Middleware גלובלי
app.use(cors({ origin: true, credentials: true })); // מאפשר בקשות Cross-Origin
app.use(morgan('dev')); // לוג בקשות לפיתוח
app.use(express.json({ limit: '10mb' })); // פענוח JSON עד 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true })); // פענוח טפסים
app.use('/user', authLimiter); // הגנה מוגברת על נתיבי משתמש
app.use(limiter); // הגבלה כללית על כל הנתיבים

app.use(express.static('./api/v1/views/wallet'));

// ייבוא וחיבור נתיבים (Routes)
const userRouter = require('./api/v1/routes/user');
const creditRouter = require('./api/v1/routes/credit');

app.use('/user', userRouter);
app.use('/credit', creditRouter);

// חיבור למסד נתונים MongoDB
const mongoConstr = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_SERVER}/${process.env.MONGO_DB}?appName=Cluster0`;

mongoose.connect(mongoConstr)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

// טיפול בנתיבים שלא נמצאו (404)
app.use((req, res) => {
  res.status(404).json({ msg: 'path not found' });
});

module.exports = app;