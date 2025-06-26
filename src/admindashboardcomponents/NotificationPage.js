import React, { useEffect, useState, useRef } from 'react';
import '../css/NotificationPage.css';
import { Box, Button, Alert } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NotificationPage = ({ themeStyle }) => {
  const [expiredList, setExpiredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/notifications/expired-certificates')
      .then(res => res.json())
      .then(data => {
        setExpiredList(data);
        // Set warning if any item has expired insurance or pollution
        const hasWarning = data.some(v => v.insuranceExpired || v.pollutionExpired);
        setWarning(hasWarning);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      });
  }, []);

  const handlePrintPDF = () => {
    const input = tableRef.current;
    if (!input) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 10;

    html2canvas(input, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - margin * 2;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.setFontSize(16);
      pdf.text('Certificates Expired Vehicle Details', pageWidth / 2, 20, { align: 'center' });
      pdf.addImage(imgData, 'PNG', margin, 30, pdfWidth, pdfHeight);
      pdf.save('Expired_Certificates_Report.pdf');
    });
  };

  return (
    <div style={themeStyle}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <h2>Certificates Expired Vehicle Details</h2>
        {!loading && expiredList.length > 0 && (
          <Button variant="outlined" color="primary" onClick={handlePrintPDF}>
            Print as PDF
          </Button>
        )}
      </Box>

      {loading ? (
        <p>Loading...</p>
      ) : expiredList.length === 0 ? (
        <p>No expired insurance or pollution certificates.</p>
      ) : (
        <>
          {warning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              ⚠️ Warning: One or more vehicles have expired insurance or pollution certificates. Please take immediate action.
            </Alert>
          )}

          <div ref={tableRef} style={{ backgroundColor: '#fff', padding: '10px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Model</th>
                  <th>Insurance Expired</th>
                  <th>Insurance Validity</th>
                  <th>Pollution Expired</th>
                  <th>Pollution Validity</th>
                </tr>
              </thead>
              <tbody>
                {expiredList.map((v, idx) => (
                  <tr key={idx}>
                    <td>{v.number}</td>
                    <td>{v.model || 'N/A'}</td>
                    <td>{v.insuranceExpired ? 'Yes' : 'No'}</td>
                    <td>{v.insuranceValidity ? new Date(v.insuranceValidity).toLocaleDateString() : 'N/A'}</td>
                    <td>{v.pollutionExpired ? 'Yes' : 'No'}</td>
                    <td>{v.pollutionValidity ? new Date(v.pollutionValidity).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPage;
