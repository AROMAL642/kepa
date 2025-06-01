const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  vehicleno: { type: String, required: true },
  startingkm: { type: Number, required: true },
  startingdate: { type: String, required: true },
  startingtime: { type: String, required: true },
  destination: { type: String, required: true },
  purpose: { type: String, required: true },
  pen: { type: String, required: true },
  endingkm: { type: Number },
  endingdate: { type: String },
  endingtime: { type: String },
  status: { type: String, default: 'Active' }, // Active, Completed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movement', movementSchema);