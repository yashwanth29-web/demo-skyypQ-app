const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true }, // preserves mock IDs like 'm1', 'm2'
    restaurantId: {
      type: String,
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    prepTime: { type: String, default: '10-15 min' },
    category: { type: String, default: 'Main Course' },
    tags: [{ type: String }],
    image: { type: String, default: '' },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, default: 4.0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', MenuItemSchema);
