const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    family: { type: String, enum: ['Woody', 'Floral', 'Citrus', 'Amber', 'Fresh'], default: 'Woody' },
    description: { type: String, default: '' },
    top: { type: String, default: '' },
    heart: { type: String, default: '' },
    base: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    size: { type: Number, default: 50 },
    stock: { type: Number, default: 0, min: 0 },
    color: { type: String, default: '#B8791F' },
    image: { type: String, default: '' },
    images: { type: [String], default: [], validate: [(arr) => arr.length <= 4, 'Up to 4 photos per fragrance'] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Product', productSchema);
