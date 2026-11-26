require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  { name: 'Cedar & Smoke', family: 'Woody', price: 120, size: 50, stock: 25, color: '#6B4A2B', featured: true,
    description: 'Dry cedar after a campfire has gone out.', top: 'Black pepper, bergamot', heart: 'Cedar, vetiver', base: 'Smoked birch, amber' },
  { name: 'White Fig Hour', family: 'Fresh', price: 95, size: 50, stock: 30, color: '#9DB88A', featured: true,
    description: 'Green fig leaf and milk, cool and quiet.', top: 'Fig leaf, mandarin', heart: 'Fig milk, jasmine tea', base: 'Musk, cedar' },
  { name: 'Saffron Rain', family: 'Amber', price: 140, size: 50, stock: 18, color: '#C98B2B', featured: true,
    description: 'Warm saffron threads over wet stone.', top: 'Saffron, pink pepper', heart: 'Rose, oud', base: 'Ambergris, patchouli' },
  { name: 'Neroli Salt', family: 'Citrus', price: 85, size: 100, stock: 40, color: '#E3C65A', featured: false,
    description: 'Sea air and bitter orange blossom.', top: 'Neroli, lemon', heart: 'Sea salt, orange blossom', base: 'White musk' },
  { name: 'Peony After Dark', family: 'Floral', price: 110, size: 50, stock: 22, color: '#C26B8A', featured: false,
    description: 'Soft peony turning dark and powdery.', top: 'Peony, lychee', heart: 'Rose, iris', base: 'Tonka, sandalwood' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Admin', email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin12345', 10), role: 'admin' });
  }
  console.log('Seeded products and admin user:', email);
  process.exit(0);
})();
