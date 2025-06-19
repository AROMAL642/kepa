// Updated RepairRequest Schema (backend/models/RepairRequests.js)
const mongoose = require('mongoose');

const repairRequestsSchema = new mongoose.Schema({
  vehicleNo: { type: String, required: true },
  pen: { type: String, required: true },
  date: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  billFile: {
    data: Buffer,
    contentType: String
  },
  status: { type: String, default: 'pending' },
  workDone: { type: String, default: 'No' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Extended fields for full workflow
  forwardedToMechanic: { type: Boolean, default: false },
  mechanicFeedback: { type: String, default: '' },
  repairStatus: { type: String, enum: ['not started', 'in progress', 'completed'], default: 'not started' },
  needsParts: { type: Boolean, default: false },
  partsList: [{ item: String, quantity: Number }],
  certificates: {
    essentiality: { type: Boolean, default: false },
    replacement: { type: Boolean, default: false }
  },
  sanctioned: { type: Boolean, default: false },
  finalBillFile: {
    data: Buffer,
    contentType: String
  },
  userApproval: { type: Boolean, default: false },
  rejectedByUser: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('RepairRequests', repairRequestsSchema);
