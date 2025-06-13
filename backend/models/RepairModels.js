const mongoose = require('mongoose');

const repairModelsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  vehicleNo: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  pen: { type: String, required: true },
  status: { type: String, default: 'pending' },
  billFile: {
  data: Buffer,
  contentType: String,
  filename: String,
  
}

});

module.exports = mongoose.model('RepairRequests', repairModelsSchema);
