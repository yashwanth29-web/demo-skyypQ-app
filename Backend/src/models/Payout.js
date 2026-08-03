const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, default: 'Weekly payout' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payout', PayoutSchema);
