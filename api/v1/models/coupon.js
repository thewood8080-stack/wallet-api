const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  source: { type: String },
  discount: { type: String },
  expiryDate: { type: Date },
  isUsed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
