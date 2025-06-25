import React, { useEffect, useState, useRef } from 'react';
import '../css/NotificationPage.css';
import { Box, Alert, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const NotificationPage = ({ themeStyle }) => {
  const [expiredList, setExpiredList] = useState([]);
  const [assignedVehicle, setAssignedVehicle] = useState('');
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.pen) return;

    const fetchData = async () => {
      try {
        const vehicleRes = await fetch(`http://localhost:5000/api/vehicles/assigned/${user.pen}`);
        const vehicleData = await vehicleRes.json();

        if (vehicleData?.vehicleNumber) {
          setAssignedVehicle(vehicleData.vehicleNumber);

          const certRes = await fetch('http://localhost:5000/api/notifications/expired-certificates');
          const certData = await certRes.json();

          const filtered = certData.filter(v => v.number === vehicleData.vehicleNumber);
          setExpiredList(filtered);

          if (filtered.some(item => item.insuranceExpired || item.pollutionExpired)) {
            setWarning(true);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={themeStyle}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Expired Certificates for Assigned Vehicle</Typography>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : !assignedVehicle ? (
        <Typography>No vehicle assigned to you.</Typography>
      ) : (
        <>
          {warning ? (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              icon={<WarningAmberIcon fontSize="inherit" />}
            >
              <strong>Warning:</strong> Your assigned vehicle <strong>{assignedVehicle}</strong> has expired insurance or pollution certificate. Please update them as soon as possible.
            </Alert>
          ) : (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            >
              <strong>All Good:</strong> Certificates are up to date for vehicle <strong>{assignedVehicle}</strong>.
            </Alert>
          )}

          {expiredList.length > 0 && (
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
        </>
      )}
    </div>
  );
};

export default NotificationPage;
