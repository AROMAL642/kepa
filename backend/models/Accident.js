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
  image: {
    data: Buffer,
    contentType: String
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Accident', accidentSchema);
