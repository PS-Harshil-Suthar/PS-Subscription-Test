const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const checkSubscription = async (req, res, next) => {
  const subscription = await Subscription.findOne({ userId: req.user.id, status: 'active' });
  if (!subscription) return res.status(403).json({ error: 'No active subscription' });

  const ticketCount = await User.countDocuments({ subscription: subscription._id });
  if (ticketCount >= subscription.ticketLimit) {
    return res.status(403).json({ error: 'Ticket limit exceeded' });
  }
  req.subscription = subscription;
  next();
};

// Create User
router.post('/', auth, checkSubscription, async (req, res) => {
  try {
    const user = new User({ ...req.body, subscription: req.subscription._id });
    await user.save();
    req.app.get('io').emit('userAdded', user);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read All Users
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ subscription: { $exists: true } }).populate('subscription');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('subscription');
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.app.get('io').emit('userUpdated', user);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete User
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    req.app.get('io').emit('userDeleted', user._id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to a Plan (Self-Managed)
router.post('/subscribe', auth, async (req, res) => {
  const { plan } = req.body;
  try {
    const plans = {
      Starter: { ticketLimit: 10 },
      Growth: { ticketLimit: 50 },
      Premium: { ticketLimit: Infinity },
    };

    let subscription = await Subscription.findOne({ userId: req.user.id });
    if (subscription) {
      subscription.plan = plan;
      subscription.ticketLimit = plans[plan].ticketLimit;
      subscription.status = 'active';
      subscription.startDate = new Date();
      subscription.endDate = null; // Or set an expiration, e.g., 30 days
      await subscription.save();
    } else {
      subscription = new Subscription({
        userId: req.user.id,
        plan,
        ticketLimit: plans[plan].ticketLimit,
        status: 'active',
      });
      await subscription.save();
    }

    await User.findByIdAndUpdate(req.user.id, { subscription: subscription._id });
    res.json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;