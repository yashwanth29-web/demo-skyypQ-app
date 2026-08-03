const mongoose = require('mongoose');
const { randomBytes } = require('crypto');

const OrderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    displayId: {
      type: String,
      unique: true,
      default: () => `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    restaurantId: { type: String, required: true, index: true },
    restaurantName: { type: String },

    // Customer reference
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      index: true,
    },
    customerName: { type: String },
    customerPhone: { type: String },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, 'Order must have at least one item'],
    },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    type: {
      type: String,
      enum: ['takeaway', 'dine-in'],
      default: 'takeaway',
    },

    // Smart kitchen schedule fields
    slot: { type: String },            // "7:20 PM" — customer arrival time
    prepTime: { type: String },        // "15 min"
    suggestedStart: { type: String },  // "7:05 PM"
    actualPrepStart: { type: String }, // "7:12 PM" - Exact time kitchen marked preparing
    actualReadyTime: { type: String }, // "7:25 PM" - Exact time kitchen marked ready
    actualArrivalTime: { type: String }, // "7:20 PM" - Exact time user clicked I'm Here
    actualPickupTime: { type: String }, // "7:26 PM" - Exact time order was marked completed
    driveTimeMins: { type: Number },
    tableNumber: { type: Number },
    specialInstructions: [{ type: String }],

    isCustomerOrder: { type: Boolean, default: true },

    // Pickup authentication
    pickupToken: {
      type: String,
      unique: true,
      sparse: true,
      default: () => randomBytes(12).toString('hex'), // 24-char hex, e.g. "a3f9c1b2d4e8f0a1b2c3d4e5"
    },
    pickupVerified: { type: Boolean, default: false }, // set true when QR/token is scanned

    // Customer arrival status
    customerArrived: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// Ensure displayId uniqueness on retry
OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.displayId) {
    this.displayId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
