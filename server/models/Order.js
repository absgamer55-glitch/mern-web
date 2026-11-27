const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    total: { type: Number, required: true },
    shipping: { name: String, phone: String, address: String, city: String },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cod', 'easypaisa', 'jazzcash', 'card', 'paypro'], default: 'cod' },
    paymentStatus: { type: String, enum: ['unpaid', 'awaiting_verification', 'paid', 'failed'], default: 'unpaid' },
    transactionId: { type: String, default: '' },
    payerNumber: { type: String, default: '' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Order', orderSchema);
