const mongoose = require('mongoose');

const RepairRequestSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  appNo: { type: String, required: true, unique: true },
  vehicleNo: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true, maxlength: 1000 }, // 100 words approx

  // New bill field for storing uploaded filename/path
  bill: { type: String, default: '' },

  verified: { type: Boolean, default: null }, // null = not verified yet, true = verified, false = not verified
  issueDescription: { type: String, default: '' },

  verificationAttempts: [{
    verified: Boolean,
    issueDescription: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('RepairRequest', RepairRequestSchema);
