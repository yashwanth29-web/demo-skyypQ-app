const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RestaurantSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true, // matches existing mock IDs like 'r1', 'r2'
      required: true,
    },
    name: { type: String, required: true, trim: true },
    cuisine: { type: String, default: 'Various' },
    rating: { type: Number, default: 4.5, min: 1, max: 5 },
    deliveryTime: { type: String, default: '20-30 min' },
    minOrder: { type: Number, default: 100 },
    image: { type: String, default: '' },
    tags: [{ type: String }],
    address: { type: String, default: '' },
    valetEnabled: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    // Owner authentication
    ownerUsername: {
      type: String,
      unique: true,
      sparse: true, // allows null until set
    },
    ownerPasswordHash: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash owner password before saving
RestaurantSchema.pre('save', async function (next) {
  if (!this.isModified('ownerPasswordHash') || !this.ownerPasswordHash) return next();
  this.ownerPasswordHash = await bcrypt.hash(this.ownerPasswordHash, 12);
  next();
});

// Compare owner password
RestaurantSchema.methods.compareOwnerPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.ownerPasswordHash);
};

module.exports = mongoose.model('Restaurant', RestaurantSchema);
