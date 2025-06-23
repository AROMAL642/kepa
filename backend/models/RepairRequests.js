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
  status: {
    type: String,
    enum: ['pending', 'forwarded', 'repaired', 'verification pending', 'verified', 'rejected' , 'sent_to_repair_admin' ,   'pending', 'approved certificates',
    'generating certificates',
    'certificate_ready',
    'forwarded_to_repair_section', // ✅ Add this
    'completed',
    'Pending User Verification',
    'Check Again',
    'final_work_done_sent_to_user' , 'for_generating_certificate' ,'waiting_for_sanction',
    'sanctioned_for_work',],
    default: 'pending'
  },
  workDone: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Workflow Fields
  forwardedToMechanic: { type: Boolean, default: false },
  mechanicFeedback: { type: String, default: '' },
  repairStatus: {
    type: String,
    enum: ['not started', 'in progress', 'completed'],
    default: 'not started'
  },
  needsParts: { type: Boolean, default: false },
  partsList: [
    {
      item: String,
      quantity: Number
    }
  ],
  certificates: {
    essentiality: { type: Boolean, default: false },
    replacement: { type: Boolean, default: false }
  },

  essentialityCertificate: {
  data: Buffer,
  contentType: String
},
technicalCertificate: {
  data: Buffer,
  contentType: String
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

