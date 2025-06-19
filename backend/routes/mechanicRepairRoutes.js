// backend/routes/mechanicRepairRoutes.js
const express = require('express');
const router = express.Router();
const RepairRequest = require('../models/RepairRequests');

const multer = require('multer');





// Configure multer for memory storage (buffer, not disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Max 5 MB
});

// ✅ 1. Forward request to mechanic
router.put('/repair-request/:id/forward-to-mechanic', async (req, res) => {
  try {
    const updatedRequest = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'forwarded',
        forwardedToMechanic: true,
        repairStatus: 'not started'
      },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error('Error forwarding to mechanic:', err);
    res.status(500).json({ message: 'Error forwarding to mechanic' });
  }
});

// ✅ 2. Get mechanic's pending tasks
// ✅ 2. Get mechanic's pending tasks
router.get('/pending', async (req, res) => {
  try {
    const tasks = await RepairRequest.find({
      status: 'forwarded',
      forwardedToMechanic: true
    });
    console.log('Fetched mechanic tasks:', tasks); 
    const formattedTasks = tasks.map(req => ({
      _id: req._id,
      vehicleNo: req.vehicleNo,
      pen: req.pen,
      date: req.date,
      subject: req.subject,
      description: req.description,
      status: req.status || 'pending',
      //userName: req.user?.name || 'Unknown',
      billFile: req.billFile?.data
        ? {
            data: req.billFile.data.toString('base64'),
            contentType: req.billFile.contentType
          }
        : null
    }));

    res.json(formattedTasks);
  } catch (err) {
    console.error('Error fetching repair requests:', err);
    res.status(500).json({ message: 'Failed to fetch repair requests' });
  }
});


// ✅ 3. Mechanic marks work done → send to user for verification
router.post('/verify/:id', async (req, res) => {
  try {
    const tasks = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'verification pending',
        repairStatus: 'completed',
        workDone: 'Yes'
      },
      { new: true }
    );

    if (!tasks) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(tasks);
  } catch (err) {
    console.error('Error verifying task:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ 4. Mechanic marks work not done → send back to MTI
router.post('/notify-mti/:id', async (req, res) => {
  try {
    const tasks = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'pending',
        forwardedToMechanic: false,
        repairStatus: 'not started',
        workDone: 'No'
      },
      { new: true }
    );

    if (!tasks) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(tasks);
  } catch (err) {
    console.error('Error sending back to MTI:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


 //Mechanic uploads bill and marks work as "Not Done"
 router.post('/mechanic/work-not-done/:id', upload.single('billFile'), async (req, res) => {
  try {
    const updated = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'sent to MTI',
        workDone: 'No',
        uploadedBillByMechanic: {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating request' });
  }
});


 //MTI verifies and forwards

router.post('/mti/verify/:id', async (req, res) => {
  const { remarks } = req.body;
  const updated = await RepairRequest.findByIdAndUpdate(req.params.id, {
    verifiedByMTI: true,
    remarksByMTI: remarks,
    status: 'sent to repair section'
  }, { new: true });
  res.json(updated);
});
//Repair Section views pending

router.get('/repair-section/pending', async (req, res) => {
  const tasks = await RepairRequest.find({ status: 'sent to repair section' });
  res.json(tasks);
});


//SP approves and generates certificates

router.post('/sp/approve/:id', async (req, res) => {
  const updated = await RepairRequest.findByIdAndUpdate(req.params.id, {
    approvedBySP: true,
    essentialityCertificateGenerated: true,
    technicalCertificateGenerated: true
  }, { new: true });
  res.json(updated);
});

// Get all repair requests forwarded to the repair section (e.g., by MTI)
router.get('/forwarded', async (req, res) => {
  try {
    const requests = await RepairRequest.find({ status: 'forwarded' });
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
