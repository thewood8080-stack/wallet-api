const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  expiryDate: { type: Date },
  isUsed: { type: Boolean, default: false },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Credit', creditSchema);