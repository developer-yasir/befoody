const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const { auth, restaurantAuth } = require('../middleware/auth');

// Get all food items (with optional restaurant filter)
router.get('/', async (req, res) => {
    try {
        const { restaurantId, category, vegetarian } = req.query;
        let query = { isAvailable: true };

        if (restaurantId) {
            query.restaurantId = restaurantId;
        }

        if (category) {
            query.category = category;
        }

        if (vegetarian === 'true') {
            query.isVegetarian = true;
        }

        const foodItems = await FoodItem.find(query).populate('restaurantId', 'name');
        res.json(foodItems);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get food item by ID
router.get('/:id', async (req, res) => {
    try {
        const foodItem = await FoodItem.findById(req.params.id).populate('restaurantId');
        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }
        res.json(foodItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create food item (restaurant owner)
router.post('/', restaurantAuth, async (req, res) => {
    try {
        const foodItem = new FoodItem(req.body);
        await foodItem.save();
        res.status(201).json(foodItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update food item
router.put('/:id', restaurantAuth, async (req, res) => {
    try {
        const foodItem = await FoodItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!foodItem) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        res.json(foodItem);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete food item
router.delete('/:id', restaurantAuth, async (req, res) => {
    try {
        await FoodItem.findByIdAndDelete(req.params.id);
        res.json({ message: 'Food item deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
