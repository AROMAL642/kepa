const mongoose = require('mongoose');

const traineeSchema = new mongoose.Schema({
  cadetNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  hasLicense: {
    type: String,
    enum: ['Yes', 'No'],
    required: true,
  },
  licenseType: {
    type: [String],
    enum: ['2W No Gear', '2W With Gear', '3W', '4W'],
    default: [],
  },
  licenseNumber: {
    type: String,
    trim: true,
  },
  licenseValidity: {
    type: Date,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  joiningDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Trainee', traineeSchema);
