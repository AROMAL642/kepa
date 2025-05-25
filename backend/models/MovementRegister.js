const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  vehicleno: { type: String, required: true },
  startingkm: { type: String, required: true },
  startingtime: { type: String, required: true },
  destination: { type: String, required: true },
  purpose: { type: String, required: true },
  officerincharge: { type: String, default: '' },
  closingkm: { type: String, default: '' },
  closingtime: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('MovementRegister', movementSchema);
