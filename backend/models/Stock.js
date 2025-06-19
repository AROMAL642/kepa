// backend/models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  itemType: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  condition: { type: String, enum: ['New', 'Used', 'Damaged'], required: true },
  status: { type: String, enum: ['Available', 'In Use', 'Damaged'], required: true },
  serialNo: { type: String, required: true },
  hasWarranty: { type: Boolean, required: true },
  warrantyNumber: { type: String, default: '' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Stock', stockSchema);
