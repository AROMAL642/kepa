const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/
  },
  model: { type: String, required: true },
  type: { type: String, required: true },
  fuelType: { type: String, required: true}, 
  status: { type: String, default: 'Active' },
  arrivedDate: { type: Date, default: Date.now },
  kmpl: { type: Number, required: true, min: 0 },
  currentDriver: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
