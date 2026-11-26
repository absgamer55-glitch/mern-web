const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    category: { type: String, enum: ['Delivery', 'Damaged item', 'Wrong item', 'Refund', 'Other'], default: 'Other' },
    subject: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    messages: [
      {
        from: { type: String, enum: ['customer', 'admin'], required: true },
        text: { type: String, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model('Ticket', ticketSchema);
