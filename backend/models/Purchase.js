const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  Firm: { type: String, required: true },
  date: { type: String, required: true },

  billNo: { type: String, required: true },

  billFile: {
    data: Buffer,
    contentType: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Purchase', purchaseSchema);
