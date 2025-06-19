import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from '@mui/material';

function TrackRepairRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const pen = localStorage.getItem('pen'); // ⬅️ Get current user PEN

  useEffect(() => {
    if (!pen) {
      console.warn('PEN not found in localStorage.');
      setRequests([]);
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/repairs/by-pen/${pen}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRequests(data);
        } else {
          console.warn('Expected array but received:', data);
          setRequests([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching repair requests:', err);
        setRequests([]);
        setLoading(false);
      });
  }, [pen]);

  const renderStatusChip = (value, label) => (
    <Chip
      label={value ? label : `No ${label}`}
      color={value ? 'success' : 'default'}
      variant={value ? 'filled' : 'outlined'}
      size="small"
    />
  );

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>
        Track Your Repair Requests
      </Typography>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <CircularProgress />
        </div>
      ) : requests.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No repair requests found for your PEN number.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vehicle No</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Work Done</TableCell>
                <TableCell>Forwarded</TableCell>
                <TableCell>Mechanic Feedback</TableCell>
                <TableCell>Repair Status</TableCell>
                <TableCell>Sanctioned</TableCell>
                <TableCell>User Approval</TableCell>
                <TableCell>Rejected</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{req.vehicleNo}</TableCell>
                  <TableCell>{req.status || 'N/A'}</TableCell>
                  <TableCell>{req.workDone || 'No'}</TableCell>
                  <TableCell>{renderStatusChip(req.forwardedToMechanic, 'Forwarded')}</TableCell>
                  <TableCell>{req.mechanicFeedback || 'N/A'}</TableCell>
                  <TableCell>{req.repairStatus || 'N/A'}</TableCell>
                  <TableCell>{renderStatusChip(req.sanctioned, 'Sanctioned')}</TableCell>
                  <TableCell>{renderStatusChip(req.userApproval, 'Approved')}</TableCell>
                  <TableCell>{renderStatusChip(req.rejectedByUser, 'Rejected')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default TrackRepairRequests;
