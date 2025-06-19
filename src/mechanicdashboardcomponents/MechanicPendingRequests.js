import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';

function MechanicPendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/repairs/verified')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((req, index) => ({
          id: req._id,
          serial: index + 1,
          vehicleNo: req.vehicleNo,
          pen: req.pen,
          date: req.date,
          subject: req.subject,
          description: req.description,
          userName: req.userName || 'N/A',
          repairStatus: req.repairStatus,
          mechanicFeedback: req.mechanicFeedback,
          workDone: req.workDone || 'No',
        }));
        setRequests(formatted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching repair requests:', err);
        setLoading(false);
      });
  }, []);

  const handleReviewClick = (row) => {
    setSelectedRequest(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleWorkCompleted = (id) => {
  fetch(`http://localhost:5000/api/repairs/${id}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ workDone: 'Yes' }),
  })
    .then((res) => res.json())
    .then((updated) => {
      // Optional: Update the frontend state
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, workDone: 'Yes' } : r))
      );
    })
    .catch((err) => console.error('Error updating workDone:', err));
};


  const columns = [
    { field: 'serial', headerName: '#', width: 50 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 120 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'subject', headerName: 'Subject', width: 150 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'repairStatus', headerName: 'Repair Status', width: 140 },
    { field: 'userName', headerName: 'Requested By', width: 130 },
    {
      field: 'review',
      headerName: 'Review',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleReviewClick(params.row)}
        >
          Review
        </Button>
      )
    },
  ];

  return (
    <div style={{ height: 500, width: '100%' }}>
      <h2>Verified Repair Requests</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <CircularProgress />
        </div>
      ) : (
        <DataGrid
          rows={requests}
          columns={columns}
          pageSize={7}
          rowsPerPageOptions={[7, 10, 20]}
        />
      )}

      {/* Modal for Review */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Repair Review</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedRequest.vehicleNo}</Typography>
              <Typography><strong>Description:</strong> {selectedRequest.description}</Typography>
              <Typography><strong>Work Done:</strong> {selectedRequest.workDone}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
          {selectedRequest?.workDone !== 'Yes' && (
            <Button
              variant="contained"
              color="success"
              onClick={handleWorkCompleted}
            >
              Work Completed
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MechanicPendingRequests;
