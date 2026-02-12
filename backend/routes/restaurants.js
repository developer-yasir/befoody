const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { auth, adminAuth, restaurantAuth } = require('../middleware/auth');

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const { cuisine, search } = req.query;
        let query = { isActive: true };

        if (cuisine) {
            query.cuisine = cuisine;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const restaurants = await Restaurant.find(query).sort({ rating: -1 });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get restaurant by ID
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(restaurant);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create restaurant (admin or restaurant owner)
router.post('/', auth, async (req, res) => {
    try {
        const restaurant = new Restaurant({
            ...req.body,
            ownerId: req.userId
        });
        await restaurant.save();
        res.status(201).json(restaurant);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update restaurant
router.put('/:id', restaurantAuth, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        if (restaurant.ownerId.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await Restaurant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete restaurant (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Restaurant deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
