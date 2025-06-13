const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  fileData: { type: String, required: true }, // base64 encoded string
  fileType: { type: String, required: true }, // MIME type (e.g., 'application/pdf')
  createdAt: { type: Date, default: Date.now }
});

const EyeTestReportSchema = new mongoose.Schema({
  pen: { type: String, required: true, unique: true },
  reports: [ReportSchema]
});

module.exports = mongoose.model('EyeTestReport', EyeTestReportSchema);
