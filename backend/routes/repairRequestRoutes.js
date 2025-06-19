const express = require('express');
const router = express.Router();
const multer = require('multer');
const RepairRequest = require('../models/RepairRequests');
const User = require('../models/User');

// Configure multer
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * POST: Create new repair request (User submits form)
 */
router.post('/', upload.single('billFile'), async (req, res) => {
  try {
    const { vehicleNo, pen, date, subject, description } = req.body;
    const user = await User.findOne({ pen });
    if (!user) return res.status(400).json({ message: `No user found with PEN ${pen}` });

    const repairData = {
      vehicleNo,
      pen,
      date,
      subject,
      description,
      status: 'pending',
      user: user._id
    };

    if (req.file) {
      repairData.billFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const newRequest = new RepairRequest(repairData);
    await newRequest.save();
    res.status(201).json({ message: 'Repair request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit repair request' });
  }
});

/**
 * GET: Admin fetch all repair requests
 */
router.get('/', async (req, res) => {
  try {
    const requests = await RepairRequest.find().populate('user', 'name pen');
    const formatted = requests.map(r => ({
      ...r.toObject(),
      billFile: r.billFile?.data ? {
        data: r.billFile.data.toString('base64'),
        contentType: r.billFile.contentType
      } : null
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch all repair requests' });
  }
});

/**
 * PUT: Admin changes status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const updated = await RepairRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Repair request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating request status' });
  }
});

/**
 * GET: Mechanic view all verified repair requests
 */
router.get('/verified', async (req, res) => {
  try {
    const requests = await RepairRequest.find({ status: 'forwarded' }).lean();
    const users = await User.find({}, 'pen name email').lean();

    const penToUserMap = {};
    users.forEach(user => {
      penToUserMap[user.pen?.trim()] = {
        name: user.name,
        email: user.email
      };
    });

    const requestsWithUser = requests.map(req => {
      const pen = req.pen?.trim();
      const userInfo = penToUserMap[pen] || { name: 'N/A', email: 'N/A' };
      return {
        ...req,
        userName: userInfo.name,
        userEmail: userInfo.email
      };
    });

    res.json(requestsWithUser);
  } catch (err) {
    console.error('Error fetching verified repair requests:', err);
    res.status(500).json({ message: 'Failed to fetch verified repair requests' });
  }
});
//complete work status update by mechanic

router.patch('/:id/complete', async (req, res) => {
  try {
    const updated = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      { workDone: 'Yes' },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update repair status' });
  }
});


/**
 * GET: Forwarded to mechanic (optional view if using `forwardedToMechanic`)
 */

router.put('/:id/forward-to-mechanic', async (req, res) => {
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





/**
 * PUT: Mechanic updates work details (progress update)
 */
router.put('/:id/mechanic-update', async (req, res) => {
  try {
    const { mechanicFeedback, needsParts, partsList, billFile } = req.body;

    const update = {
      mechanicFeedback,
      needsParts,
      partsList: needsParts ? partsList : [],
      repairStatus: 'in progress',
      status: needsParts ? 'awaiting_parts_approval' : 'work_done_sent_to_user'
    };

    if (billFile) {
      update.finalBillFile = {
        data: Buffer.from(billFile.data, 'base64'),
        contentType: billFile.contentType
      };
    }

    const result = await RepairRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update mechanic info' });
  }
});


// GET: All forwarded requests (seen by MTI)
router.get('/forwarded', async (req, res) => {
  try {
    const requests = await RepairRequest.find({ forwardedToMechanic: true }).populate('user', 'name pen');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch forwarded requests' });
  }
});

/**
 * POST: Mechanic marks as done and sends for user verification
 */
router.post('/verify/:id', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Repair not found' });

    request.status = 'Pending User Verification';
    await request.save();
    res.json({ message: 'Sent for user verification' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify repair' });
  }
});

/**
 * POST: Notify MTI for rechecking
 */
router.post('/notify-mti/:id', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Repair not found' });

    request.status = 'Check Again';
    await request.save();
    res.json({ message: 'MTI notified' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to notify MTI' });
  }
});

/**
 * PUT: Final repair marked done by admin/MTI
 */
router.put('/:id/final-repair-done', async (req, res) => {
  try {
    const request = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'final_work_done_sent_to_user' },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark final repair done' });
  }
});

module.exports = router;
