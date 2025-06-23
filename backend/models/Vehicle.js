const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  insurancePolicyNo: { type: String },
  insuranceValidity: { type: Date },
  insuranceExpense: { type: Number },
  insuranceFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  pollutionValidity: { type: Date },
  pollutionExpense: { type: Number },
  pollutionFile: {
    data: Buffer,
    contentType: String,
    originalName: String,
  },
  updatedAt: { type: Date, default: Date.now }
});

const vehicleSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  model: { type: String, required: true },
  type: { type: String, required: true },
  fuelType: { type: String, required: true },
  status: { type: String, default: 'Active' },
  arrivedDate: { type: Date, default: Date.now },
  kmpl: { type: Number, required: true, min: 0 },

  // Certificate history containing insurance and pollution records
  certificateHistory: [certificateSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
