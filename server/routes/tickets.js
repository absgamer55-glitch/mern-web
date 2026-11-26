const router = require('express').Router();
const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const load = (q) => q.populate('user', 'name email').populate('order', 'items total status createdAt');

// Customer opens a ticket, optionally about one of their own orders.
router.post('/', protect, async (req, res, next) => {
  try {
    const { order, category, subject, message } = req.body;
    if (!subject?.trim() || !message?.trim()) return res.status(400).json({ message: 'Add a subject and a message' });
    let orderId = null;
    if (order) {
      const o = await Order.findOne({ _id: order, user: req.user._id });
      if (!o) return res.status(400).json({ message: 'That order is not on your account' });
      orderId = o._id;
    }
    const t = await Ticket.create({
      user: req.user._id, order: orderId, category, subject,
      messages: [{ from: 'customer', text: message.trim() }],
    });
    res.status(201).json(await load(Ticket.findById(t._id)));
  } catch (e) { next(e); }
});

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await load(Ticket.find({ user: req.user._id }).sort({ updatedAt: -1 }))); } catch (e) { next(e); }
});

router.get('/', protect, adminOnly, async (req, res, next) => {
  try { res.json(await load(Ticket.find().sort({ updatedAt: -1 }))); } catch (e) { next(e); }
});

router.post('/:id/reply', protect, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const t = await Ticket.findById(req.params.id);
    if (!t || (!isAdmin && String(t.user) !== String(req.user._id))) return res.status(404).json({ message: 'Ticket not found' });
    if (t.status === 'closed') return res.status(400).json({ message: 'This ticket is closed' });
    if (!req.body.text?.trim()) return res.status(400).json({ message: 'Write a message first' });
    t.messages.push({ from: isAdmin ? 'admin' : 'customer', text: req.body.text.trim() });
    t.status = isAdmin ? 'answered' : 'open';
    await t.save();
    res.json(await load(Ticket.findById(t._id)));
  } catch (e) { next(e); }
});

// Admin can set any status. A customer can only close their own ticket.
router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const { status } = req.body;
    const t = await Ticket.findById(req.params.id);
    if (!t || (!isAdmin && String(t.user) !== String(req.user._id))) return res.status(404).json({ message: 'Ticket not found' });
    if (!isAdmin && status !== 'closed') return res.status(403).json({ message: 'You can only close your ticket' });
    t.status = status;
    await t.save();
    res.json(await load(Ticket.findById(t._id)));
  } catch (e) { next(e); }
});

module.exports = router;
