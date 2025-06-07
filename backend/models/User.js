const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  pen: {
    type: String,
    unique: true,
    required: true
  },
  generalNo: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    unique: true,
    required: true,
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
  },

  licenseNo: String,
  
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  photo: String,
  signature: String,
  password: {
    type: String,
    required: true
  },
  verified: {
    type: String,
    default: 'NO'
  },
  role: {
    type: String,
    enum: ['user', 'admin','mti','repair','fuel'],
    default: 'user'
  }
}, {
  timestamps: true
});



module.exports = mongoose.model('User', userSchema);