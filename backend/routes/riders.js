const express = require('express');
const router = express.Router();
const Rider = require('../models/Rider');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// Register as rider
router.post('/register', auth, async (req, res) => {
    try {
        const { vehicleType, vehicleNumber, licenseNumber } = req.body;

        const existingRider = await Rider.findOne({ userId: req.userId });
        if (existingRider) {
            return res.status(400).json({ message: 'Already registered as rider' });
        }

        const rider = new Rider({
            userId: req.userId,
            vehicleType,
            vehicleNumber,
            licenseNumber
        });

        await rider.save();
        res.status(201).json(rider);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get rider profile
router.get('/profile', auth, async (req, res) => {
    try {
        const rider = await Rider.findOne({ userId: req.userId }).populate('userId', 'name email phone');
        if (!rider) {
            return res.status(404).json({ message: 'Rider profile not found' });
        }
        res.json(rider);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all deliveries for a rider
router.get('/my-deliveries', auth, async (req, res) => {
    try {
        const rider = await Rider.findOne({ userId: req.userId });
        if (!rider) {
            return res.status(404).json({ message: 'Rider profile not found' });
        }

        const orders = await Order.find({ riderId: rider._id })
            .populate('restaurantId', 'name address phone')
            .populate('userId', 'name phone')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get available orders for pickup
router.get('/available-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({
            status: 'ready_for_pickup',
            $or: [{ riderId: null }, { riderId: { $exists: false } }]
        })
            .populate('restaurantId', 'name address')
            .populate('userId', 'name phone')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Accept order
router.post('/accept-order/:orderId', auth, async (req, res) => {
    try {
        const rider = await Rider.findOne({ userId: req.userId });
        if (!rider) {
            return res.status(404).json({ message: 'Rider profile not found' });
        }

        if (rider.activeOrderId) {
            return res.status(400).json({ message: 'You already have an active order' });
        }

        const order = await Order.findById(req.params.orderId);
        if (!order || order.status !== 'ready_for_pickup') {
            return res.status(400).json({ message: 'Order not available' });
        }

        order.riderId = rider._id;
        order.status = 'out_for_delivery';
        await order.save();

        rider.activeOrderId = order._id;
        await rider.save();

        // Emit socket event
        const io = req.app.get('socketio');
        io.to(`user_${order.userId}`).emit('orderStatusUpdate', order);

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get active delivery
router.get('/active-delivery', auth, async (req, res) => {
    try {
        const rider = await Rider.findOne({ userId: req.userId });
        if (!rider || !rider.activeOrderId) {
            return res.json(null);
        }

        const order = await Order.findById(rider.activeOrderId)
            .populate('restaurantId', 'name address phone')
            .populate('userId', 'name phone');

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Complete delivery
router.post('/complete-delivery/:orderId', auth, async (req, res) => {
    try {
        const rider = await Rider.findOne({ userId: req.userId });
        const order = await Order.findById(req.params.orderId);

        if (!order || order.riderId.toString() !== rider._id.toString()) {
            return res.status(400).json({ message: 'Invalid order' });
        }

        order.status = 'delivered';
        await order.save();

        rider.activeOrderId = null;
        rider.totalDeliveries += 1;
        rider.earnings += order.deliveryFee;
        await rider.save();

        // Emit socket event
        const io = req.app.get('socketio');
        io.to(`user_${order.userId}`).emit('orderStatusUpdate', order);

        res.json({ order, rider });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get delivery history
router.get('/history', auth, async (req, res) => {
    try {
        const rider = await Rider.findOne({ userId: req.userId });
        const orders = await Order.find({
            riderId: rider._id,
            status: 'delivered'
        })
            .populate('restaurantId', 'name')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update availability
router.put('/availability', auth, async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const rider = await Rider.findOneAndUpdate(
            { userId: req.userId },
            { isAvailable },
            { new: true }
        );
        res.json(rider);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
