const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { getMethods, publicMethods } = require('../payments');

// Which payment methods can be used (public, shown at checkout).
router.get('/payment-methods', (req, res) => res.json(publicMethods()));

// Place an order. Prices come from the database, never from the browser.
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shipping, paymentMethod = 'cod', transactionId, payerNumber } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Your cart is empty' });
    if (!shipping?.name || !shipping?.phone || !shipping?.address || !shipping?.city)
      return res.status(400).json({ message: 'Fill in all delivery details' });

    const method = getMethods().find((m) => m.id === paymentMethod);
    if (!method || !method.enabled) return res.status(400).json({ message: 'Choose an available payment method' });

    let paymentStatus = 'unpaid';
    let tid = '';
    if (method.kind === 'wallet') {
      tid = String(transactionId || '').trim().toUpperCase();
      if (tid.length < 6) return res.status(400).json({ message: 'Enter the transaction ID from your payment message' });
      if (await Order.findOne({ transactionId: tid }))
        return res.status(409).json({ message: 'That transaction ID was already used on another order' });
      paymentStatus = 'awaiting_verification';
    }

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
    const order = await Order.create({
      user: req.user._id, items: lines, total, shipping,
      paymentMethod: method.id, paymentStatus, transactionId: tid, payerNumber: String(payerNumber || '').trim(),
    });
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

// Admin confirms (or rejects) a payment.
router.put('/:id/payment', protect, adminOnly, async (req, res, next) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.paymentStatus }, { new: true, runValidators: true })
      .populate('user', 'name email');
    if (!o) return res.status(404).json({ message: 'Order not found' });
    res.json(o);
  } catch (e) { next(e); }
});

module.exports = router;
