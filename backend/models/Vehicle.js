const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  type: { type: String, required: true },
  fuelType: { type: String, required: true },
  status: { type: String, default: 'Active' },
  arrivedDate: { type: Date, default: Date.now },
  kmpl: { type: Number, required: true, min: 0 },

  insurancePolicyNo: { type: String },
  insuranceValidity: { type: Date },
  pollutionValidity: { type: Date },

  insuranceFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  pollutionFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
