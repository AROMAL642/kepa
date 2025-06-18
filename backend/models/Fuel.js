const mongoose = require('mongoose');

const FuelEntrySchema = new mongoose.Schema({
  pen: { type: String, required: true },
  firmName: { type: String },
  presentKm: { type: Number, required: true },
  previousKm: { type: Number },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  kmpl: { type: Number },
  date: { type: Date, required: true },
  billNo: { type: String, required: true },
  fullTank: { type: Boolean, required: true }, // ✅ changed from enum to Boolean
  file: { type: Buffer },
  fileType: { type: String },
  fuelType: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const VehicleFuelSchema = new mongoose.Schema({
  vehicleNo: { type: String, required: true, unique: true },
  fuelEntries: [FuelEntrySchema]
});

module.exports = mongoose.model('VehicleFuel', VehicleFuelSchema);
