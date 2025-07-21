const express = require('express');
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Create a new food item (Restaurant or Admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Restaurant or Admin only.' });
  }
  try {
    const newFoodItem = new FoodItem(req.body);
    const foodItem = await newFoodItem.save();
    res.status(201).json(foodItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all food items (can be filtered by restaurant ID)
router.get('/', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let foodItems;
    if (restaurantId) {
      foodItems = await FoodItem.find({ restaurant: restaurantId }).populate('restaurant');
    } else {
      foodItems = await FoodItem.find().populate('restaurant');
    }
    res.json(foodItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get food item by ID
router.get('/:id', async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id).populate('restaurant');
    if (!foodItem) {
      return res.status(404).json({ msg: 'Food item not found' });
    }
    res.json(foodItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a food item (Restaurant or Admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Restaurant or Admin only.' });
  }
  try {
    let foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ msg: 'Food item not found' });
    }

    // Optional: Add logic to ensure restaurant can only update their own food items
    // if (req.user.role === 'restaurant' && foodItem.restaurant.toString() !== req.user.id) {
    //   return res.status(403).json({ msg: 'Access denied. You can only update your own food items.' });
    // }

    foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(foodItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a food item (Restaurant or Admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Restaurant or Admin only.' });
  }
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ msg: 'Food item not found' });
    }

    // Optional: Add logic to ensure restaurant can only delete their own food items
    // if (req.user.role === 'restaurant' && foodItem.restaurant.toString() !== req.user.id) {
    //   return res.status(403).json({ msg: 'Access denied. You can only delete your own food items.' });
    // }

    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Food item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
