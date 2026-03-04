const Coupon = require('../models/coupon');
const mongoose = require('mongoose');

const addCoupon = async (req, res) => {
  try {
    const { description, source, discount, expiryDate } = req.body;
    const trimmedDesc = typeof description === 'string' ? description.trim() : '';
    const trimmedSource = typeof source === 'string' ? source.trim() : 'כללי';
    const trimmedDiscount = typeof discount === 'string' ? discount.trim() : (typeof discount === 'number' ? String(discount) : '');
    let validDate = expiryDate ? new Date(expiryDate) : null;
    if (validDate && isNaN(validDate.getTime())) validDate = null;

    if (!trimmedDesc || trimmedDesc.length < 1) {
      return res.status(400).json({ msg: 'Description is required' });
    }

    const coupon = new Coupon({
      userId: req.user.userId,
      description: trimmedDesc,
      source: trimmedSource || 'כללי',
      discount: trimmedDiscount || undefined,
      expiryDate: validDate || undefined
    });
    await coupon.save();
    res.status(201).json({ msg: 'Coupon added successfully', coupon });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to add coupon' });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ userId: req.user.userId });
    res.status(200).json(coupons);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch coupons' });
  }
};

const useCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }
    const coupon = await Coupon.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isUsed: true },
      { new: true }
    );
    if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });
    res.status(200).json({ msg: 'Coupon marked as used', coupon });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update coupon' });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }
    const coupon = await Coupon.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!coupon) return res.status(404).json({ msg: 'Coupon not found' });
    res.status(200).json({ msg: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete coupon' });
  }
};

module.exports = { addCoupon, getCoupons, useCoupon, deleteCoupon };
