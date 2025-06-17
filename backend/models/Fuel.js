const mongoose = require('mongoose');

// Sub-schema for each fuel entry
const fuelEntrySchema = new mongoose.Schema({
  pen: { type: String, required: true },
  firmName: { type: String, required: true },
  presentKm: { type: Number, required: true },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  previousKm: { type: Number, required: true },
  kmpl: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  billNo: { type: String, required: true },
  fullTank: { type: String, enum: ['yes', 'no'], required: true },
  
  file: { type: Buffer },
  fileType: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

// Main schema: one document per vehicle
const vehicleFuelSchema = new mongoose.Schema({
  vehicleNo: { type: String, required: true, unique: true },
  fuelEntries: [fuelEntrySchema]
}, { timestamps: true });

module.exports = mongoose.model('VehicleFuel', vehicleFuelSchema);