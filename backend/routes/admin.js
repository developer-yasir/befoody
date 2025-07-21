const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodItem = require('../models/FoodItem');
const Order = require('../models/Order');

// Middleware to check if user is admin
const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', auth, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', auth, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/restaurants
// @desc    Get all restaurants
// @access  Private (Admin only)
router.get('/restaurants', auth, authorizeAdmin, async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/admin/restaurants
// @desc    Create a new restaurant (Admin can create for others)
// @access  Private (Admin only)
router.post('/restaurants', auth, authorizeAdmin, async (req, res) => {
  try {
    const newRestaurant = new Restaurant(req.body);
    const restaurant = await newRestaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/restaurants/:id
// @desc    Update a restaurant
// @access  Private (Admin only)
router.put('/restaurants/:id', auth, authorizeAdmin, async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/restaurants/:id
// @desc    Delete a restaurant
// @access  Private (Admin only)
router.delete('/restaurants/:id', auth, authorizeAdmin, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Restaurant removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/fooditems
// @desc    Get all food items
// @access  Private (Admin only)
router.get('/fooditems', auth, authorizeAdmin, async (req, res) => {
  try {
    const foodItems = await FoodItem.find().populate('restaurant');
    res.json(foodItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/fooditems/:id
// @desc    Delete a food item
// @access  Private (Admin only)
router.delete('/fooditems/:id', auth, authorizeAdmin, async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ msg: 'Food item not found' });
    }
    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Food item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/admin/orders
// @desc    Get all orders
// @access  Private (Admin only)
router.get('/orders', auth, authorizeAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .populate('items.foodItem', 'name price');
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/orders/:id/status', auth, authorizeAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
