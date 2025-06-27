const express = require('express');
const router = express.Router();
const multer = require('multer');
const RepairRequest = require('../models/RepairRequests');
const User = require('../models/User');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const Vehicle = require('../models/Vehicle'); // make sure the path is correct
const VehicleMovement = require('../models/Movement');
const path = require('path');
const fs = require('fs');





// Configure multer
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * POST: Create new repair request (User submits form)
 */
router.post('/', upload.single('billFile'), async (req, res) => {
  try {
    const { vehicleNo, pen,date, mr,subject, description } = req.body;
    const user = await User.findOne({ pen });
    if (!user) return res.status(400).json({ message: `No user found with PEN ${pen}` });

    const repairData = {
      vehicleNo,
      pen,
      
      date,
      mr,
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
      } : null,

      













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
      status: {
        $in: [
          'for_generating_certificate',
          'certificate_ready',
          'waiting_for_sanction',
          'sanctioned_for_work',
          'ongoing_work',
          'completed','work completed',
    'Pending User Verification',
    'Check Again',
        ]
      },
      finalBillFile: { $exists: true }
    });

    const formatted = requests.map(r => ({
      _id: r._id,
      pen: r.pen,
      date: r.date,
      vehicleNo: r.vehicleNo,
      subject: r.subject,
      status: r.status,

        expense: r.expense || '',
  workerWage: r.workerWage || '',

   partsList: r.partsList || [],

      // Final bill
      finalBillFile:
        r.finalBillFile && r.finalBillFile.data
          ? {
              contentType: r.finalBillFile.contentType,
              data: r.finalBillFile.data.toString('base64')
            }
          : null,

      // Verified work bill
      verifiedWorkBill:
        r.verifiedWorkBill && r.verifiedWorkBill.data
          ? {
              contentType: r.verifiedWorkBill.contentType,
              data: r.verifiedWorkBill.data.toString('base64')
            }
          : null,

      // ✅ Safely handle additionalBill
      additionalBill:
        r.additionalBill && r.additionalBill.data
          ? {
              contentType: r.additionalBill.contentType,
              data: r.additionalBill.data.toString('base64')
            }
          : null
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
      status: 'sent_to_MTI',
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


// forward to repair section by MTI Admin


router.put('/:id/forward-to-repair', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🛠 Backend received ID from params:", id);

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid or missing ID' });
    }

    const request = await RepairRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    request.status = 'forwarded_to_repair_section';
    await request.save();

    return res.json({ message: 'Request forwarded to Repair Section' });
  } catch (err) {
    console.error('🔥 Error in backend:', err);
    res.status(500).json({ message: 'Error while forwarding the request' });
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

// fetching name from pen 


// routes/userRoutes.js or similar
/*
router.get('/pen/:pen', async (req, res) => {
  try {
    const user = await User.findOne({ pen: req.params.pen });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});
*/

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
      status: 'sent_to_MTI' // ✅ <-- this is the key change
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
    // const { signature } = req.body;

    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

   //request.digitalSignature = signature; 
   
    


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

router.put('/:id/sanction-work', upload.single('additionalBill'), async (req, res) => {
  try {
    const requestId = req.params.id;
    //const { approvedNo } = req.body;

    const additionalBill = req.file;

    if (!additionalBill) return res.status(400).json({ error: 'Sanction bill file is required' });

    const updated = await RepairRequest.findByIdAndUpdate(
      requestId,
      {
        //approvedNo,
        additionalBill: {
          data: additionalBill.buffer,
          contentType: additionalBill.mimetype,
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

router.patch('/:id/complete', upload.single('verifiedWorkBill'), async (req, res) => {
  try {
    const updateData = {
      workDone: 'Yes',
      status: 'completed'
    };





     if (req.body.expense) {
      const expense = Number(req.body.expense);
      if (!isNaN(expense)) {
        updateData.expense = expense;
      }
    }

    if (req.body.workerWage) {
      const wage = Number(req.body.workerWage);
      if (!isNaN(wage)) {
        updateData.workerWage = wage;
      }
    }



    if (req.file) {
      updateData.verifiedWorkBill = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    const updated = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
     if (!updated) {
      return res.status(404).json({ error: 'Repair request not found.' });
    }

    res.json(updated);
  } catch (error) {
    console.error('❌ Mechanic complete error:', error);
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


// request check in user section which is sent by mechanic to check work done

router.patch('/:id/verify', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isApproved = String(req.body.userApproval).toLowerCase() === 'true';
    const isRejected = String(req.body.rejectedByUser).toLowerCase() === 'true';

    request.userApproval = isApproved;
    request.rejectedByUser = isRejected;
    request.userRemarks = req.body.userRemarks?.trim() || '';

    if (isApproved) {
      request.status = 'work completed';
      request.workDone = 'Yes';
    } else if (isRejected) {
      request.status = 'Check Again';
      request.workDone = 'No';
    }

    await request.save();
    res.status(200).json({ message: 'Verification updated successfully' });
  } catch (err) {
    console.error('PATCH /verify error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




router.patch('/:id/mechanic-verification', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  const updateData = {
    workDone: 'Yes',
    status: 'completed',
  };

  if (file) {
    updateData.billFile = {
      data: file.buffer.toString('base64'),
      contentType: file.mimetype,
    };
  }

  await RepairRequest.findByIdAndUpdate(id, updateData);
  res.json({ success: true });
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


// for mechanic to user for notifying check work done

/**
 * PUT: Mechanic sends repair to user for verification
 */
router.put('/:id/send-to-user', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Repair request not found' });

    request.status = 'Pending User Verification';
    request.sentToUserForVerification = true;
    await request.save();

    res.json({ message: 'Repair sent to user for verification' });
  } catch (err) {
    console.error('Error sending to user:', err);
    res.status(500).json({ message: 'Failed to send repair to user' });
  }
});






















/**
 * GET: Generate and view Essentiality Certificate
 */




router.get('/:id/view-ec', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const currentYear = new Date().getFullYear();

    // 🔍 If already has serial for this year, reuse
    if (!request.certificateSerial || request.serialYear !== currentYear) {
      const lastSerial = await RepairRequest.findOne({ serialYear: currentYear })
        .sort({ certificateSerial: -1 })
        .select('certificateSerial')
        .lean();

      const newSerial = lastSerial ? lastSerial.certificateSerial + 1 : 1;

      request.certificateSerial = newSerial;
      request.serialYear = currentYear;
      await request.save();
    }

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Essentiality_Certificate_${request.vehicleNo}.pdf"`);

    doc.pipe(res);

    // ✅ Header with certificate number
    doc.fontSize(12).text(
      `No. ${request.certificateSerial} /${currentYear}/AD(T&MTS)/KEPA`,
      { align: 'right' }
    );
    doc.text(`Office of the Asst.Director(Tech & MT Studies)`, { align: 'right' });
    doc.text(`Kerala Police Academy, R.V.Puram,Thrissur`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });

    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text('ESSENTIALITY CERTIFICATE', {
      align: 'center',
      underline: true
    });
    doc.moveDown(1.5);

    const vehicleNo = request.vehicleNo || '__________';
    const subject = request.subject || '';
    const partsList = request.partsList || [];

    doc.font('Helvetica').fontSize(12).text(
      `It is hereby certified that Vehicle number ${vehicleNo} (${subject}) has been inspected at this office, and the following spare parts have been found to be defective. Accordingly, these items are recommended for replacement with new ones.`,
      { align: 'justify' }
    );

    doc.moveDown(1.5);

    // ======= Table =======
    const startX = 70;
    let startY = doc.y;
    const colWidths = [50, 300, 100];

    doc.rect(startX, startY, colWidths[0], 25).stroke();
    doc.rect(startX + colWidths[0], startY, colWidths[1], 25).stroke();
    doc.rect(startX + colWidths[0] + colWidths[1], startY, colWidths[2], 25).stroke();

    doc.font('Helvetica-Bold').fontSize(11);
    doc.text('Sl No', startX + 15, startY + 7);
    doc.text('Items', startX + colWidths[0] + 10, startY + 7);
    doc.text('Quantity', startX + colWidths[0] + colWidths[1] + 10, startY + 7);

    startY += 25;

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

    const vehicleNo = request.vehicleNo?.toString().trim();
    const vehicle = await Vehicle.findOne({ number: vehicleNo });
    const vehicleModel = vehicle?.model || '__________';

    let latestEndingKm = '__________';
    const movementDoc = await VehicleMovement.findOne({ vehicleno: vehicleNo });
    if (movementDoc && Array.isArray(movementDoc.movements)) {
      const sorted = [...movementDoc.movements]
        .filter(m => typeof m.endingkm === 'number')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sorted.length > 0) {
        latestEndingKm = `${sorted[0].endingkm} kms`;
      }
    }

    // Start PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="Technical_Certificate_${vehicleNo}.pdf"`
    );
    doc.pipe(res);

    // === Table Settings ===
    const startX = 40;
    let y = doc.y;
    const fullWidth = 520;

    // Unified Column Layout
    const columnWidths = [120, 400]; // 2-column table for header & vehicle info
    const partsColWidths = [40, 140, 80, 80, 60, 120]; // For parts table

    // === Row Drawers ===
    const drawInfoRow = (label, value) => {
      const rowHeight = 25;
      let x = startX;

      // Label cell
      doc.rect(x, y, columnWidths[0], rowHeight).stroke();
      doc.font('Helvetica-Bold').fontSize(10).text(label, x + 5, y + 7);
      x += columnWidths[0];

      // Value cell
      doc.rect(x, y, columnWidths[1], rowHeight).stroke();
      doc.font('Helvetica').fontSize(10).text(value, x + 5, y + 7);

      y += rowHeight;
    };

    const drawFullRow = (text, isHeader = false) => {
      const rowHeight = 25;
      doc.rect(startX, y, fullWidth, rowHeight).stroke();
      doc
        .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(12)
        .text(text, startX + 5, y + 7, {
          width: fullWidth - 10,
          align: isHeader ? 'center' : 'left',
        });
      y += rowHeight;
    };

    const drawPartsHeader = () => {
      let x = startX;
      const rowHeight = 25;
      const headers = ['Sl No', 'Items', 'Quantity', 'Previous Date', 'Previous MR', 'KM after Previous Replace'];

      headers.forEach((head, i) => {
        doc.rect(x, y, partsColWidths[i], rowHeight).stroke();
        doc.font('Helvetica-Bold').fontSize(10).text(head, x + 4, y + 7, {
          width: partsColWidths[i] - 8,
        });
        x += partsColWidths[i];
      });
      y += rowHeight;
    };

    const drawPartsRow = (part, index) => {
      let x = startX;
      const rowHeight = 25;
      const values = [
        index + 1,
        part.item || '',
        part.quantity || '',
        part.previousDate || '',
        part.previousMR || '',
        part.kmAfterReplacement || ''
      ];

      values.forEach((val, i) => {
        doc.rect(x, y, partsColWidths[i], rowHeight).stroke();
        doc.font('Helvetica').fontSize(10).text(val.toString(), x + 4, y + 7, {
          width: partsColWidths[i] - 8,
        });
        x += partsColWidths[i];
      });
      y += rowHeight;
    };

    // === DRAW Unified Table ===
   drawFullRow(`No: ${request.tcSerialNumber || '___'} /2025/MTO/KEPA`, 'left');

    drawFullRow('REPLACEMENT STATEMENT OF SPARES', true); // centered heading
    drawInfoRow('Reg. No.', vehicleNo);
    drawInfoRow('Model', vehicleModel);
    drawInfoRow('Total KM Covered', latestEndingKm);

    drawPartsHeader();

    (request.partsList || []).forEach((part, index) => {
      drawPartsRow(part, index);
    });

    doc.end();
  } catch (err) {
    console.error('❌ Error generating Technical Certificate:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate Technical Certificate' });
    }
  }
});



router.put('/:id/update-parts', async (req, res) => {
  try {
    const { partsList } = req.body;

    const request = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      { partsList },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    res.json(request);
  } catch (err) {
    console.error('Error updating parts list:', err);
    res.status(500).json({ message: 'Failed to update parts list' });
  }
});

// Save/Update TC Serial Number
router.put('/:id/update-tc-serial', async (req, res) => {
  try {
    const { tcSerialNumber } = req.body;

    const request = await RepairRequest.findByIdAndUpdate(
      req.params.id,
      { tcSerialNumber },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    res.json(request);
  } catch (err) {
    console.error('Error updating TC Serial Number:', err);
    res.status(500).json({ message: 'Failed to update TC Serial Number' });
  }
});


//const colWidths = [80, 150, 120, 80, 60, 100];
// fron mechanic to admin to see final bill

// PATCH: Final bill upload and mark as completed (with verifiedWorkBill)


router.patch('/:id/complete', upload.single('verifiedWorkBill'), async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.workDone = 'Yes';
    request.status = 'completed';

    // ✅ Save verifiedWorkBill
    if (req.file) {
      request.verifiedWorkBill = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    // ✅ Save expense
    if (req.body.expense !== undefined && !isNaN(req.body.expense)) {
      request.expense = parseFloat(req.body.expense);
    }

    await request.save();
    res.status(200).json({ message: 'Request updated with bill and expense' });
  } catch (err) {
    console.error("Error updating repair request:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/:id/send-for-approval', async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'certificate_ready') {
      return res.status(400).json({ message: 'Request not ready for approval' });
    }

    request.status = 'waiting_for_sanction';
    request.forwardedTo = 'AYAPSE';
    request.forwardedDate = new Date();

    await request.save();

    // OPTIONAL: trigger AYAPSE notification here
    // notify('ayapse', `Request from PEN ${request.pen} sent for approval.`);

    res.status(200).json({ message: 'Request sent for approval', data: request });
  } catch (error) {
    console.error('Error sending for approval:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// for viewwing verified work bill for admin submitted by mechanic

// Add this to your routes
router.get('/completed', async (req, res) => {
  try {
    const completedRequests = await RepairRequest.find({ status: 'completed' });

    const formatted = completedRequests.map((req) => ({
      ...req.toObject(),
      verifiedWorkBill: req.verifiedWorkBill?.data
        ? {
            data: req.verifiedWorkBill.data.toString('base64'),
            contentType: req.verifiedWorkBill.contentType
          }
        : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Failed to fetch completed repairs:', err);
    res.status(500).json({ error: 'Internal server error' });
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
