const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  vehicleNo: {
    type: String,
    required: true
  },
  pen: {
    type: String,
    required: true
  },
  accidentTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  bill: {
    data: Buffer,
    contentType: String
  },
  status: { 
    type: String,
    enum: ['verified', 'rejected', 'pending'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Accident', accidentSchema) 