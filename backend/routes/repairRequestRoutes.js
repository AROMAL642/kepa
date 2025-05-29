const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');

router.post('/pdf', async (req, res) => {
  try {
    const { date, appNo, vehicleNo, subject, description } = req.body;

    const doc = new PDFDocument({ margin: 50 }); // add some margin for neatness
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=RepairRequest_${appNo}.pdf`,
          'Content-Length': pdfData.length,
        })
        .end(pdfData);
    });

    // Title
    doc.fontSize(18).text('Repair Request Form', { align: 'center' });
    doc.moveDown(2);

    // Use fixed x position for labels and values for aligned columns
    const labelX = 50;
    const valueX = 180;
    let y = doc.y;

    // Date
    doc.fontSize(12).text('Date:', labelX, y);
    doc.text(new Date(date).toLocaleDateString(), valueX, y);

    y += 20;
    doc.text('Application No:', labelX, y);
    doc.text(appNo, valueX, y);

    y += 20;
    doc.text('Vehicle No:', labelX, y);
    doc.text(vehicleNo, valueX, y);

    y += 20;
    doc.text('Subject:', labelX, y);
    doc.text(subject, valueX, y);

    y += 40;
    doc.fontSize(14).text('Description:', labelX, y, { underline: true });
    y += 25;

    // Description - wrap text within page width minus margins
    doc.fontSize(12).text(description, {
      align: 'left',
      indent: 20,
      lineGap: 4,
      width: doc.page.width - doc.options.margin * 2,
      height: 300,
      ellipsis: true,
    });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

module.exports = router;
