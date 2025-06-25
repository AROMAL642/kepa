const express = require('express');
const router = express.Router();
const multer = require('multer');
const RepairRequest = require('../models/RepairRequests');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

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
      
      //user: user.name,
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

// static routes

/**
 * GET: Get all requests eligible for certificate generation
 */
router.get('/for-generating-certificate', async (req, res) => {
  try {
    const requests = await RepairRequest.find({
      status: { $in: ['for_generating_certificate' , 'certificate_ready' , 'waiting_for_sanction',
    'sanctioned_for_work', 'ongoing_work'] },
     finalBillFile: { $exists: true}
    });

    const formatted = requests.map(r => ({
      _id: r._id,
      pen: r.pen,
      date: r.date,
      vehicleNo: r.vehicleNo,
      status: r.status,
      subject: r.subject,
      billAvailable: !!r.finalBillFile,
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching certificate generation requests:', err);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});


router.get('/certificates', async (req, res) => {
  try {
    const requests = await RepairRequest.find({
      status: { $in: ['pending_certificate', 'generating_certificates'] } // adjust according to your schema
    });
    res.json(requests);
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ message: "Server error" });
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


// GET: Only mechanic requests forwarded and needing parts (for admin/MTI view)
router.get('/forwarded', async (req, res) => {
  try {
    const requests = await RepairRequest.find({
      forwardedToMechanic: true,
      workDone: 'No',
      needsParts: true,
      status: 'sent_to_repair_admin',
      partsList: { $exists: true, $not: { $size: 0 } }
    }).populate('user', 'name pen');

    const formatted = requests.map(r => ({
      ...r.toObject(),
      finalBillFile: r.finalBillFile?.data
        ? {
            data: r.finalBillFile.data.toString('base64'),
            contentType: r.finalBillFile.contentType
          }
        : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching mechanic part requests:', err);
    res.status(500).json({ message: 'Failed to fetch mechanic requests' });
  }
});



//track status by user
router.get('/by-pen/:pen', async (req, res) => {
  try {
    const { pen } = req.params;

    if (!pen) {
      return res.status(400).json({ error: 'PEN not provided' });
    }

    const repairs = await RepairRequest.find({ pen });

    res.json(repairs);
  } catch (err) {
    console.error('Error fetching by pen:', err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});



//Dynamic routes only after static routes


/**
 * GET: Get single repair request by ID (used in admin view)
 */
router.get('/:id', async (req, res) => {
  try {
    const repair = await RepairRequest.findById(req.params.id);
    if (!repair) return res.status(404).json({ message: 'Repair request not found' });

    const formatted = {
      ...repair.toObject(),
      billFile: repair.billFile?.data ? {
        data: repair.billFile.data.toString('base64'),
        contentType: repair.billFile.contentType
      } : null
    };

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching repair by ID:', err);
    res.status(500).json({ message: 'Failed to fetch repair request' });
  }
});




//Dynamic PUTS and POSTS

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
 * GET: Forwarded to mechanic by admin (optional view if using `forwardedToMechanic`)
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
      status: 'sent_to_repair_admin' // ✅ <-- this is the key change
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





// forward to repair section by MTI Admin
// router.get('/:id/forward-to-repair', async (req, res) => {

router.put('/:id/forward-to-repair', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.body.id);
    if (!request) return res.status(404).json({ message: 'Repair not found' });

    request.status = 'forwarded_to_repair_section';
    await request.save();

    res.json({ message: 'Request forwarded to Repair Section' });
  } catch (err) {
    console.error('Error forwarding to repair section:', err);
    res.status(500).json({ message: 'Failed to forward to repair section' });
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



router.put('/:id/forward-to-certificates', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'for_generating_certificate'; // ✅ Correct
    await request.save();

    res.json({ message: 'Request forwarded to Main Admin for certificate generation' });
  } catch (err) {
    console.error('Error forwarding to certificates tab:', err);
    res.status(500).json({ message: 'Failed to forward to certificates tab' });
  }
});






router.post('/:id/complete-certificates', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'certificate_ready';

    await request.save();
    res.json({ message: 'Certificates marked as ready' });
  } catch (err) {
    console.error('Certificate completion error:', err);
    res.status(500).json({ message: 'Failed to complete certificate process' });
  }
});




// Inside repairRequestRoutes.js
router.post('/:id/generate-certificates', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Simulate generated PDFs
    request.essentialityCertificate = {
      data: Buffer.from('ESSENTIALITY CERTIFICATE BASE64', 'base64'),
      contentType: 'application/pdf'
    };
    request.technicalCertificate = {
      data: Buffer.from('TECHNICAL CERTIFICATE BASE64', 'base64'),
      contentType: 'application/pdf'
    };

    // ✅ Update status
    request.status = 'certificate_ready';

    await request.save();
    return res.status(200).json({ message: 'Certificates generated successfully' ,  updatedRequest: request});

  } catch (err) {
    console.error('Certificate generation error:', err);
    res.status(500).json({ message: 'Certificate generation failed' });
  }
});


// repair section forwards to MTI Admin

router.put('/:id/sanction-work', upload.single('sanctionBillFile'), async (req, res) => {
  try {
    const requestId = req.params.id;
    //const { approvedNo } = req.body;

    const sanctionBill = req.file;

    if (!sanctionBill) return res.status(400).json({ error: 'Sanction bill file is required' });

    const updated = await RepairRequest.findByIdAndUpdate(
      requestId,
      {
        //approvedNo,
        sanctionBillFile: {
          data: sanctionBill.buffer,
          contentType: sanctionBill.mimetype,
        },
        status: 'sanctioned_for_work',
      },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error('Sanction forwarding error:', err);
    res.status(500).json({ error: 'Sanction forwarding failed' });
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
 * PUT: Main admin verifies and sends to mechanic after getting sanction
 */
router.put('/:id/verify-and-send-to-mechanic', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'ongoing_work';
    request.forwardedToMechanic = true;

    await request.save();
    res.json({ message: 'Request verified and sent to mechanic for work' });
  } catch (err) {
    console.error('Error verifying and sending to mechanic:', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});


/**
 * GET: Generate and view Essentiality Certificate
 */
router.get('/:id/view-ec', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Essentiality_Certificate_${request.vehicleNo}.pdf"`);

    doc.pipe(res);

    // ========== Header ==========
    doc.fontSize(12).text(`No........ /2025/AD(T&MTS)/KEPA`, { align: 'right' });
    doc.text(`Office of the Asst.Director(Tech & MT Studies)`, { align: 'right' });
    doc.text(`Kerala Police Academy, R.V.Puram,Thrissur`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text('ESSENTIALITY CERTIFICATE', { align: 'center', underline: true });
    doc.moveDown(1.5);

    const vehicleNo = request.vehicleNo || '__________';
    const subject = request.subject || '';
    const partsList = request.partsList || [];

    doc.font('Helvetica').fontSize(12).text(
      `It is hereby certified that Vehicle number ${vehicleNo} (${subject}) has been inspected at this office, and the following spare parts have been found to be defective. Accordingly, these items are recommended for replacement with new ones.`,
      { align: 'justify' }
    );

    doc.moveDown(1.5);

    // ========== Table ==========

    // Column positions and widths
    const startX = 70;
    let startY = doc.y;
    const colWidths = [50, 300, 100]; // Sl No, Items, Quantity

    // Draw header row
    doc.rect(startX, startY, colWidths[0], 25).stroke();
    doc.rect(startX + colWidths[0], startY, colWidths[1], 25).stroke();
    doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], 25).stroke();

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Sl No', startX + 15, startY + 7);
    doc.text('Items', startX + colWidths[0] + 10, startY + 7);
    doc.text('Quantity', startX + colWidths[0] + colWidths[1] + 10, startY + 7);

    startY += 25;

    // Draw rows
    doc.font('Helvetica');
    partsList.forEach((item, index) => {
      doc.rect(startX, startY, colWidths[0], 25).stroke();
      doc.rect(startX + colWidths[0], startY, colWidths[1], 25).stroke();
      doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], 25).stroke();

      doc.text(`${index + 1}`, startX + 15, startY + 7);
      doc.text(item.item || 'N/A', startX + colWidths[0] + 10, startY + 7);
      doc.text(item.quantity || 'N/A', startX + colWidths[0] + colWidths[1] + 10, startY + 7);

      startY += 25;
    });

    doc.end();

  } catch (err) {
    console.error('Error generating EC PDF:', err);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});





// GET: View Technical Certificate
router.get('/:id/view-tc', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Technical_Certificate_${request.vehicleNo}.pdf"`);

    doc.pipe(res);

    // ===== Header =====
    doc.fontSize(12).text(`No: /2020/MTO/KEPA`, { align: 'left' });
    doc.moveDown(1);
    doc.fontSize(14).text('REPLACEMENT STATEMENT OF SPARES', { align: 'center', underline: true });
    doc.moveDown(1.5);

    doc.fontSize(12);
    doc.text(`Reg. No: ${request.vehicleNo || '__________'}`);
    doc.text(`Model: ${request.model || '__________'}`);
    doc.text(`Total KM Covered: ${request.kilometerCovered || '__________'}`);
    doc.moveDown(1);

    // ===== Table Header =====
    const startY = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Sl No', 50, startY);
    doc.text('Items', 100, startY);
    doc.text('Quantity', 230, startY);
    doc.text('Previous Date', 300, startY);
    doc.text('Previous MR', 390, startY);
    doc.text('KM After Replacement', 470, startY);
    doc.font('Helvetica');
    doc.moveTo(50, startY + 15).lineTo(570, startY + 15).stroke();
    doc.moveDown(1);

    // ===== Table Data =====
    const partsList = request.partsList || [];
    partsList.forEach((part, index) => {
      doc.text(index + 1, 50, doc.y);
      doc.text(part.item || 'N/A', 100, doc.y);
      doc.text(part.quantity || 'N/A', 230, doc.y);
      doc.text('N/A', 300, doc.y);
      doc.text('N/A', 390, doc.y);
      doc.text('N/A', 470, doc.y);
      doc.moveDown(0.7);
    });

    doc.end();
  } catch (err) {
    console.error('Error generating TC PDF:', err);
    res.status(500).json({ message: 'Failed to generate technical certificate' });
  }
});

router.get('/pending/count', async (req, res) => {
  try {
    const count = await RepairRequest.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});


// GET /api/repair/pending/count
router.get('/mechanicpending/count', async (req, res) => {
  try {
    const count = await RepairRequest.countDocuments({ status: 'forwarded' });
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending count' });
  }
});


module.exports = router;
