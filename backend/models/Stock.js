const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  pen: { type: String, required: true }, 
  itemType: { type: String, required: true },
  itemName: { type: String, required: true },
  serialNo: { type: String, required: true },
  quantity: { type: Number, required: true },
  condition: { type: String, required: true },
  status: { type: String, required: true },
  hasWarranty: { type: Boolean, required: true },
  warrantyNumber: { type: String, default: '' },
  date: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
