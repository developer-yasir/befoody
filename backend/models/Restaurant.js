const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  cuisine: {
    type: [String],
  },
  openingHours: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
