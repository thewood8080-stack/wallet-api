const Credit = require('../models/credit');
const mongoose = require('mongoose');

const addCredit = async (req, res) => {
  try {
    const { storeName, amount, expiryDate } = req.body;
    const trimmedStore = typeof storeName === 'string' ? storeName.trim() : '';
    const numAmount = Number(amount);
    let validDate = expiryDate ? new Date(expiryDate) : null;
    if (validDate && isNaN(validDate.getTime())) validDate = null;

    if (!trimmedStore || trimmedStore.length < 1) {
      return res.status(400).json({ msg: 'Store name is required' });
    }
    if (typeof numAmount !== 'number' || isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    const credit = new Credit({
      userId: req.user.userId,
      storeName: trimmedStore,
      amount: numAmount,
      expiryDate: validDate || undefined
    });
    await credit.save();
    res.status(201).json({ msg: 'Credit added successfully', credit });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to add credit' });
  }
};

const getCredits = async (req, res) => {
  try {
    const credits = await Credit.find({ userId: req.user.userId });
    res.status(200).json(credits);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch credits' });
  }
};

const useCredit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }
    const credit = await Credit.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { isUsed: true },
      { new: true }
    );
    if (!credit) return res.status(404).json({ msg: 'Credit not found' });
    res.status(200).json({ msg: 'Credit marked as used', credit });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update credit' });
  }
};

const deleteCredit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid id' });
    }
    const credit = await Credit.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!credit) return res.status(404).json({ msg: 'Credit not found' });
    res.status(200).json({ msg: 'Credit deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete credit' });
  }
};

module.exports = { addCredit, getCredits, useCredit, deleteCredit };
