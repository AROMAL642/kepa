import React, { useEffect, useState, useRef } from 'react';
import '../css/NotificationPage.css';
import { Box, Button } from '@mui/material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const NotificationPage = ({ themeStyle }) => {
  const [expiredList, setExpiredList] = useState([]);
  const [assignedVehicle, setAssignedVehicle] = useState('');
  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.pen) return;

    const fetchData = async () => {
      try {
        // Step 1: Fetch assigned vehicle
        const vehicleRes = await fetch(`http://localhost:5000/api/vehicles/assigned/${user.pen}`);
        const vehicleData = await vehicleRes.json();

        if (vehicleData?.vehicleNumber) {
          setAssignedVehicle(vehicleData.vehicleNumber);

          // Step 2: Fetch all expired certificates
          const certRes = await fetch('http://localhost:5000/api/notifications/expired-certificates');
          const certData = await certRes.json();

          // Step 3: Filter only the assigned vehicle's expired data
          const filtered = certData.filter(v => v.number === vehicleData.vehicleNumber);
          setExpiredList(filtered);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      pdf.text('Assigned Vehicle Expired Certificate Report', pageWidth / 2, 20, { align: 'center' });
      pdf.addImage(imgData, 'PNG', margin, 30, pdfWidth, pdfHeight);
      pdf.save('Expired_Certificate_Report.pdf');
    });
  };

  return (
    <div style={themeStyle}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <h2>Expired Certificates for Assigned Vehicle</h2>
        {!loading && expiredList.length > 0 && (
          <Button variant="outlined" color="primary" onClick={handlePrintPDF}>
            Print as PDF
          </Button>
        )}
      </Box>

      {loading ? (
        <p>Loading...</p>
      ) : !assignedVehicle ? (
        <p>No vehicle assigned to you.</p>
      ) : expiredList.length === 0 ? (
        <p>No expired insurance or pollution certificates for vehicle <strong>{assignedVehicle}</strong>.</p>
      ) : (
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
      )}
    </div>
  );
};

export default NotificationPage;
