const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  Firm: { type: String, required: true },
  date: { type: String, required: true },
  billNo: { type: String, required: true },
  warrantyNumber: { type: String, default: '' },
  billFile: {
    data: Buffer,
    contentType: String
  },
  pen: { type: String, required: true }
}, {
  timestamps: true
});


module.exports = mongoose.model('Purchase', purchaseSchema);
