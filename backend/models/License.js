const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema({
  pen: { type: String, required: true },
  licenseNo: { type: String, required: true },
  validityDate: { type: Date, required: true },
  file: {
    data: Buffer,
    contentType: String,
    originalName: String
  }
}, { timestamps: true });

module.exports = mongoose.model('License', LicenseSchema);
