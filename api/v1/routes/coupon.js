const express = require('express');
const router = express.Router();
const { addCoupon, getCoupons, useCoupon, deleteCoupon } = require('../controllers/coupon');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, addCoupon);         // הוספת קופון
router.get('/', authMiddleware, getCoupons);         // שליפת קופונים
router.put('/:id', authMiddleware, useCoupon);       // מימוש קופון
router.delete('/:id', authMiddleware, deleteCoupon); // מחיקת קופון

module.exports = router;