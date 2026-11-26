const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Fill in name, email and password' });
    if (password.length < 6) return res.status(400).json({ message: 'Password needs at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'That email already has an account' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(401).json({ message: 'Email or password is wrong' });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: 'Name cannot be empty' });
      user.name = name.trim();
    }
    if (email !== undefined && email.trim().toLowerCase() !== user.email) {
      const next_email = email.trim().toLowerCase();
      if (await User.findOne({ email: next_email })) return res.status(409).json({ message: 'That email already has an account' });
      user.email = next_email;
    }
    if (newPassword) {
      if (!(await bcrypt.compare(currentPassword || '', user.password))) return res.status(400).json({ message: 'Current password is wrong' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'New password needs at least 6 characters' });
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    res.json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

module.exports = router;
