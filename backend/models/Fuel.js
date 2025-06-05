const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema({
  firmName: { type: String, required: true },
  vehicleNo: { type: String, required: true },
  pen: { type: String, required: true },
  presentKm: { type: Number, required: true },
  quantity: { type: Number, required: true },
  amount: { type: Number, required: true },
  previousKm: { type: Number, required: true },
  kmpl: { type: Number, required: true },
  date: { type: Date, required: true },
  billNo: { type: Number, required: true },
  fullTank: { type: String, enum: ['yes', 'no'], required: true },
  file: { type: Buffer },
  fileType: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FuelRegister', fuelSchema);
