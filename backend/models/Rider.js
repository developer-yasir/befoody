const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['bike', 'scooter', 'car', 'bicycle'],
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    currentLocation: {
        latitude: Number,
        longitude: Number
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 0,
        max: 5
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    earnings: {
        type: Number,
        default: 0
    },
    activeOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Rider', riderSchema);
