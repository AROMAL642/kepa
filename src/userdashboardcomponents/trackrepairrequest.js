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
  Dialog, DialogTitle, DialogContent, DialogActions,
  Radio, RadioGroup, FormControlLabel,
  TextField, Button
} from '@mui/material';

function TrackRepairRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [userVerification, setUserVerification] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const pen = localStorage.getItem('pen');

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
      sx={{
        pointerEvents: 'none',
        cursor: 'default',
      }}
    />
  );

  const handleVerifyClick = (req) => {
    setSelectedRequest(req);
    setUserVerification('');
    setRejectionReason('');
    setVerifyOpen(true);
  };

  const handleSubmitVerification = async () => {
    if (!selectedRequest) return;

    const payload = {
      userApproval: userVerification === 'yes',
      rejectedByUser: userVerification === 'no',
      userRemarks: userVerification === 'no' ? rejectionReason : ''
    };

    try {
      const res = await fetch(`http://localhost:5000/api/repair-request/${selectedRequest._id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('✅ Feedback submitted');
        setVerifyOpen(false);
        setRequests((prev) =>
  prev.map((r) =>
    r._id === selectedRequest._id
      ? {
          ...r,
          userApproval: userVerification === 'yes',
          rejectedByUser: userVerification === 'no',
          userRemarks: userVerification === 'no' ? rejectionReason : '',
          status: userVerification === 'yes' ? 'work completed' : 'Check Again',
          workDone: userVerification === 'yes' ? 'Yes' : 'No'
          
        }
      : r
  )
);


      } else {
        alert('❌ Failed to submit');
      }
    } catch (err) {
      console.error('Error submitting verification:', err);
      alert('❌ Network error');
    }
  };

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
                <TableCell>Forwarded By MTI</TableCell>
                <TableCell>Mechanic Feedback</TableCell>
                <TableCell>Repair Status</TableCell>
                <TableCell>Sanctioned</TableCell>
                <TableCell>User Approval</TableCell>
                <TableCell>Rejected</TableCell>
                <TableCell>Check & Verify</TableCell>
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
                  <TableCell>
                    {req.status === 'Pending User Verification' ? (
                      <Button variant="outlined" size="small" onClick={() => handleVerifyClick(req)}>
                        Check & Verify
                      </Button>
                    ) : req.status === 'work completed' ? (
                      <Chip label="Verified" color="success" size="small" />
                    ) : req.rejectedByUser ? (
                      <Chip label="Rejected" color="error" size="small" />
                    ) : (
                      <Chip label="N/A" variant="outlined" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ✅ Modal for User Verification */}
      <Dialog open={verifyOpen} onClose={() => setVerifyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Verify Work Completion</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Vehicle: <strong>{selectedRequest?.vehicleNo}</strong>
          </Typography>
          <Typography>Is the work done satisfactorily?</Typography>
          <RadioGroup
            row
            value={userVerification}
            onChange={(e) => setUserVerification(e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>

          {userVerification === 'no' && (
            <TextField
              label="Reason for rejection"
              multiline
              rows={3}
              fullWidth
              margin="normal"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitVerification}
            disabled={!userVerification || (userVerification === 'no' && !rejectionReason)}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TrackRepairRequests;
