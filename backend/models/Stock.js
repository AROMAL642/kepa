// backend/models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  itemType: String,
  itemName: String,
  serialNo: String,
  quantity: Number,
  condition: String,
  status: String,
  hasWarranty: Boolean,
  warrantyNumber: String,
  date: Date
});

module.exports = mongoose.model('Stock', stockSchema);
