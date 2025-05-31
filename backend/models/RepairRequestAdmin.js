const mongoose = require('mongoose');

const RepairRequestAdminSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  penNumber: { type: String, required: true },
  vehicleNumber: { type: String },
  description: { type: String },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.RepairRequest || mongoose.model('RepairRequest', RepairRequestAdminSchema);
