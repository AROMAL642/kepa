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
    enum: ['pending', 'forwarded', 'repaired', 'verification pending', 'verified', 'rejected' , 'sent_to_MTI' ,   'pending', 'approved certificates',
    'generating certificates',
    'certificate_ready',
    'forwarded_to_repair_section', 
    
    'completed','work completed',
    'forwarded_to_repair_section', 
    
    'completed','work completed',
    'Pending User Verification',
    'Check Again',
    'final_work_done_sent_to_user' , 'for_generating_certificate' ,'waiting_for_sanction',
    'sanctioned_for_work', 'ongoing_work','awaiting_user_verification' ],
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
      quantity: String,
      previousDate: String,     
      previousMR: String,      
        kmAfterReplacement: String 
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

verifiedWorkBill: {
  data: Buffer,
  contentType: String
},
quotationBill: {
  data: Buffer,
  contentType: String
},
additionalBill: {
  data: Buffer,
  contentType: String
},


verifiedWorkBill: {
  data: Buffer,
  contentType: String
},
quotationBill: {
  data: Buffer,
  contentType: String
},
additionalBill: {
  data: Buffer,
  contentType: String
},

  userApproval: { type: Boolean, default: false },
  rejectedByUser: { type: Boolean, default: false },
  userRemarks: { type: String, default: '' },

  expense: { type: Number, default: 0 },
workerWage: { type: Number, default: 0 },
  sanctionedNumber: { type: String, default: '' },

 
 mr: { type: String, default: '' },
kmCovered : { type: String, default: '' },
certificateSerial: { type: Number },
serialYear: { type: Number },
 technicalCertificateNumber: { type: String },
  technicalCertificateTable: [
    {
      date: String,
      mr: String,
      km: String
    }
  ],
  tcSerialNumber: { type: String }, 
signedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
},

  
}, {
  timestamps: true
});

module.exports = mongoose.model('RepairRequests', repairRequestsSchema);

// previousDate: String,
   // previousMR: String,
    //kmAfterReplacement: String