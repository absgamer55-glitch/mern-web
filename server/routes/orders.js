const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// Place an order. Prices come from the database, never from the browser.
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shipping } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty' });
    if (!shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city)
      return res.status(400).json({ message: 'Fill in all delivery details' });

    const lines = [];
    let total = 0;
    for (const it of items) {
      const p = await Product.findById(it.product);
      const qty = Math.max(1, parseInt(it.qty, 10) || 1);
      if (!p) return res.status(400).json({ message: 'A fragrance in your cart no longer exists' });
      if (p.stock < qty) return res.status(400).json({ message: `${p.name}: only ${p.stock} left` });
      lines.push({ product: p._id, name: p.name, price: p.price, qty });
      total += p.price * qty;
    }
    for (const l of lines) await Product.findByIdAndUpdate(l.product, { $inc: { stock: -l.qty } });
    const order = await Order.create({ user: req.user._id, items: lines, total, shipping });
    res.status(201).json(order);
  } catch (e) { next(e); }
});

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } catch (e) { next(e); }
});

router.get('/', protect, adminOnly, async (req, res, next) => {
  try { res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 })); } catch (e) { next(e); }
});

router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true })
      .populate('user', 'name email');
    if (!o) return res.status(404).json({ message: 'Order not found' });
    res.json(o);
  } catch (e) { next(e); }
});

module.exports = router;
