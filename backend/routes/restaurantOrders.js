const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/restaurant/orders
// @desc    Get all orders for the authenticated restaurant
// @access  Private (Restaurant only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ msg: 'Access denied. Restaurant only.' });
  }
  try {
    const orders = await Order.find({ restaurant: req.user.id })
      .populate('user', 'name email')
      .populate('items.foodItem', 'name price');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/restaurant/orders/:id/status
// @desc    Update the status of an order for the authenticated restaurant
// @access  Private (Restaurant only)
router.put('/:id/status', auth, async (req, res) => {
  const io = req.app.get('socketio');
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ msg: 'Access denied. Restaurant only.' });
  }
  const { status } = req.body;
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Ensure the order belongs to the authenticated restaurant
    if (order.restaurant.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    // Populate order for emitting
    await order.populate('user', 'name email');
    await order.populate('restaurant', 'name');
    for (let i = 0; i < order.items.length; i++) {
      await order.items[i].populate('foodItem', 'name price');
    }

    // Emit order status update event
    io.emit('orderStatusUpdate', order);
    io.to(order.user._id.toString()).emit('userOrderUpdate', order);
    io.to(order.restaurant._id.toString()).emit('restaurantOrderUpdate', order);

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;