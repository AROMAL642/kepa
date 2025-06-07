const mongoose = require('mongoose');

// Sub-schema for each movement entry
const movementEntrySchema = new mongoose.Schema({
  startingkm: { type: Number, required: true },
  startingdate: { type: String, required: true },
  startingtime: { type: String, required: true },
  destination: { type: String, required: true },
  purpose: { type: String, required: true },
  pen: { type: String, required: true },
  officerincharge: { type: String },
  endingkm: { type: Number },
  endingdate: { type: String },
  endingtime: { type: String },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
}); 

// Main schema: one document per vehicle
const vehicleMovementSchema = new mongoose.Schema({
  vehicleno: { type: String, required: true, unique: true },
  movements: [movementEntrySchema]
});

module.exports = mongoose.model('VehicleMovement', vehicleMovementSchema);
