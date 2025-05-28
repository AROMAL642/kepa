const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
    match: /^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$/ // Matches format: XX-00-XX-0000
  },
  model: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['car', 'bike', 'jeep', 'minivan', 'bus'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'decommissioned'],
    default: 'active'
  },
  arrivedDate: {
    type: Date,
    default: Date.now
  },
  kmpl: {
    type: Number,
    required: true,
    min: 0
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
