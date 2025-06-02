const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/, // KL08BP0111 or KL08B0111
  },
  model: { type: String, required: true },
  type: { type: String, required: true },
  fuelType: { type: String, required: true },
  status: { type: String, default: 'Active' },
  arrivedDate: { type: Date, default: Date.now },
  kmpl: { type: Number, required: true, min: 0 },
  currentDriver: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
