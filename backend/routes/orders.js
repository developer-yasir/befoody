const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

// Create order (supports both authenticated and guest checkout)
router.post('/', async (req, res) => {
    try {
        // Check if user is authenticated
        const token = req.header('Authorization')?.replace('Bearer ', '');
        let userId = null;

        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (err) {
                // Token invalid, treat as guest
                console.log('Invalid token, treating as guest checkout');
            }
        }

        // Validate required fields
        const { restaurantId, items, totalAmount, deliveryAddress, paymentMethod } = req.body;

        if (!restaurantId) {
            return res.status(400).json({ message: 'Restaurant ID is required' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
            return res.status(400).json({ message: 'Complete delivery address is required' });
        }

        // If guest checkout, validate guest info
        if (!userId && !req.body.guestInfo) {
            return res.status(400).json({ message: 'Guest information is required for guest checkout' });
        }

        // Ensure userId is handled correctly
        const orderData = { ...req.body };
        if (userId) {
            orderData.userId = userId;
        } else {
            delete orderData.userId; // Ensure no invalid userId is passed for guest
        }

        console.log('Creating order:', JSON.stringify(orderData, null, 2));

        const order = new Order(orderData);
        await order.save();

        if (userId) {
            await order.populate('restaurantId userId');
        } else {
            await order.populate('restaurantId');
        }

        // Emit socket event for real-time update
        const io = req.app.get('socketio');
        if (order.restaurantId) {
            // Use _id because restaurantId is populated
            const restaurantId = order.restaurantId._id || order.restaurantId;
            io.to(`restaurant_${restaurantId.toString()}`).emit('newOrder', order);
        }

        res.status(201).json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId })
            .populate('restaurantId', 'name imageUrl')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('restaurantId userId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order or is admin
        if (order.userId._id.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get order by ID (public for tracking)
router.get('/track/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('restaurantId', 'name phone address');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return limited information for public tracking
        const publicOrderData = {
            _id: order._id,
            status: order.status,
            items: order.items,
            totalAmount: order.totalAmount,
            restaurant: order.restaurantId,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
            // Don't expose full user details or sensitive info
        };

        res.json(publicOrderData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update order status
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        // Emit socket event for real-time update
        const io = req.app.get('socketio');
        io.to(`user_${order.userId}`).emit('orderStatusUpdate', order);

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all orders (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('restaurantId userId')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get orders for a specific restaurant
router.get('/restaurant/:restaurantId', auth, async (req, res) => {
    try {
        const orders = await Order.find({ restaurantId: req.params.restaurantId })
            .populate('userId', 'name email') // Populate user details
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
