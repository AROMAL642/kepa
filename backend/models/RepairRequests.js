const mongoose = require('mongoose');

const repairRequestsSchema = new mongoose.Schema({
  vehicleNo: {
    type: String,
    required: true
  },
  pen: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  billFile: {
    data: Buffer,
    contentType: String
  },
status: {
    type: String,
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RepairRequests', repairRequestsSchema);

