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

        // Emit socket event (safely)
        try {
            if (order.userId) {
                const io = req.app.get('socketio');
                if (io) {
                    io.to(`user_${order.userId}`).emit('orderStatusUpdate', order);
                }
            } else {
                console.warn(`Order ${order._id} has no userId, skipping socket update.`);
            }
        } catch (socketError) {
            console.error('Socket emission failed:', socketError);
            // Continue execution, do not fail the request
        }

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

// Get aggregated earnings
router.get('/earnings', auth, async (req, res) => {
    try {
        const rider = await Rider.findOne({ userId: req.userId });
        if (!rider) return res.status(404).json({ message: 'Rider not found' });

        // Get all completed orders for this rider
        const orders = await Order.find({
            riderId: rider._id,
            status: 'delivered'
        }).sort({ updatedAt: -1 });

        // Calculate Today's Earnings
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysOrders = orders.filter(o => new Date(o.updatedAt) >= today);
        const todayEarnings = todaysOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

        // Calculate Weekly Earnings (Last 7 Days)
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const weekOrders = orders.filter(o => new Date(o.updatedAt) >= lastWeek);
        const weekEarnings = weekOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

        // Daily breakdown for chart (Last 7 days)
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });

            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.updatedAt);
                return orderDate.getDate() === d.getDate() &&
                    orderDate.getMonth() === d.getMonth() &&
                    orderDate.getFullYear() === d.getFullYear();
            });

            chartData.push({
                day: dateStr,
                amount: dayOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0)
            });
        }

        res.json({
            totalEarnings: rider.earnings,
            today: { amount: todayEarnings, count: todaysOrders.length },
            week: { amount: weekEarnings, count: weekOrders.length },
            chart: chartData,
            recentPayouts: [ // Mock payouts
                { id: 1, date: '2023-10-25', amount: 150.00, status: 'Paid' },
                { id: 2, date: '2023-10-18', amount: 200.50, status: 'Paid' }
            ]
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update Rider Profile (Vehicle/License)
router.put('/profile', auth, async (req, res) => {
    try {
        const { vehicleType, vehicleNumber } = req.body;

        const rider = await Rider.findOneAndUpdate(
            { userId: req.userId },
            { vehicleType, vehicleNumber },
            { new: true }
        ).populate('userId', 'name email phone');

        if (!rider) return res.status(404).json({ message: 'Rider not found' });

        res.json(rider);
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
