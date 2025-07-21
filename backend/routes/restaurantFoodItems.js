const express = require('express');
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST api/restaurant/fooditems
// @desc    Create a new food item for a restaurant
// @access  Private (Restaurant only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ msg: 'Access denied. Restaurant only.' });
  }
  try {
    const newFoodItem = new FoodItem({ ...req.body, restaurant: req.user.id }); // Associate food item with the restaurant user's ID
    const foodItem = await newFoodItem.save();
    res.status(201).json(foodItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/restaurant/fooditems
// @desc    Get all food items for a specific restaurant
// @access  Private (Restaurant only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ msg: 'Access denied. Restaurant only.' });
  }
  try {
    const foodItems = await FoodItem.find({ restaurant: req.user.id }).populate('restaurant');
    res.json(foodItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/restaurant/fooditems/:id
// @desc    Update a food item for a restaurant
// @access  Private (Restaurant only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ msg: 'Access denied. Restaurant only.' });
  }
  try {
    let foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ msg: 'Food item not found' });
    }

    // Ensure the food item belongs to the authenticated restaurant
    if (foodItem.restaurant.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this food item' });
    }

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

// @route   DELETE api/restaurant/fooditems/:id
// @desc    Delete a food item for a restaurant
// @access  Private (Restaurant only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'restaurant') {
    return res.status(403).json({ msg: 'Access denied. Restaurant only.' });
  }
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    if (!foodItem) {
      return res.status(404).json({ msg: 'Food item not found' });
    }

    // Ensure the food item belongs to the authenticated restaurant
    if (foodItem.restaurant.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this food item' });
    }

    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Food item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
