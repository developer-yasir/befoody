const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new order (User only)
router.post('/', auth, async (req, res) => {
  const io = req.app.get('socketio');
  try {
    const newOrder = new Order({ ...req.body, user: req.user.id });
    const order = await newOrder.save();

    // Populate order for emitting
    await order.populate('user', 'name email');
    await order.populate('restaurant', 'name');
    for (let i = 0; i < order.items.length; i++) {
      await order.items[i].populate('foodItem', 'name price');
    }

    // Emit new order event to admins and relevant restaurant
    io.emit('newOrder', order);
    io.to(order.restaurant._id.toString()).emit('restaurantOrderUpdate', order);

    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all orders (Admin only, or user-specific for users)
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find().populate('user').populate('restaurant').populate('items.foodItem');
    } else if (req.user.role === 'user') {
      orders = await Order.find({ user: req.user.id }).populate('user').populate('restaurant').populate('items.foodItem');
    } else if (req.user.role === 'restaurant') {
      // For restaurants, fetch orders related to their restaurant ID
      // This would require the restaurant user to have a restaurant ID associated with their account
      // For simplicity, let's just return an empty array or an error for now if not admin/user
      return res.status(403).json({ msg: 'Access denied. Not implemented for restaurant role yet.' });
    }
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user').populate('restaurant').populate('items.foodItem');
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Ensure user can only view their own orders unless they are admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. You can only view your own orders.' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update order status (Admin or Restaurant only)
router.put('/:id', auth, async (req, res) => {
  const io = req.app.get('socketio');
  if (req.user.role !== 'admin' && req.user.role !== 'restaurant') {
    return res.status(403).json({ msg: 'Access denied. Admin or Restaurant only.' });
  }
  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Optional: Add logic to ensure restaurant can only update status of their own restaurant's orders
    // if (req.user.role === 'restaurant' && order.restaurant.toString() !== req.user.restaurantId) {
    //   return res.status(403).json({ msg: 'Access denied. You can only update orders for your restaurant.' });
    // }

    order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true }
    );

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

// Delete an order (Admin only)
router.delete('/:id', auth, async (req, res) => {
  const io = req.app.get('socketio');
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);

    // Emit order deleted event
    io.emit('orderDeleted', order._id);

    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;