const mongoose = require('mongoose');

// Sub-schema for a single certificate entry
const certificateEntrySchema = new mongoose.Schema({
  insurancePolicyNo: { type: String, required: true }, // ✅ required
  insuranceValidity: { type: Date },
  insuranceIssuedDate: { type: Date },
  insuranceExpense: { type: Number },
  insuranceFile: {
    data: Buffer,
    contentType: String,
    originalName: String
  },

  pollutionCertificateNo: { type: String, required: true }, // ✅ new + required
  pollutionValidity: { type: Date },
  pollutionIssuedDate: { type: Date },
  pollutionExpense: { type: Number },
  pollutionFile: {
    data: Buffer,
    contentType: String,
    originalName: String
  },

  updatedAt: { type: Date, default: Date.now }
});

// Main Vehicle schema
const vehicleSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  model: { type: String },
  type: { type: String },
  fuelType: { type: String },
  status: { type: String },
  arrivedDate: { type: Date },
  kmpl: { type: Number },
  currentDriver: { type: String },
  certificateHistory: [certificateEntrySchema]
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
