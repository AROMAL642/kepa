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
  useMediaQuery,
  useTheme
} from '@mui/material';
import '../css/MechanicPendingRequests.css';

function MechanicPendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState(null);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetch('http://localhost:5000/api/repairs')
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
          billImage: req.billFile
            ? {
                url: `data:${req.billFile.contentType};base64,${req.billFile.data}`,
                type: req.billFile.contentType
              }
            : null
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
        if (!updated || !updated._id) {
          alert('Update failed.');
          return;
        }

        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  workDone: 'Yes',
                  repairStatus: 'completed',
                }
              : r
          )
        );

        handleCloseModal();
      })
      .catch((err) => {
        console.error('Error updating workDone:', err);
        alert('Failed to mark as completed.');
      });
  };

  const handleViewFile = (file) => {
    setFileToPreview(file);
    setFilePreviewOpen(true);
  };

  const handleCloseFilePreview = () => {
    setFileToPreview(null);
    setFilePreviewOpen(false);
  };

  const columns = [
    { field: 'serial', headerName: '#', width: 60 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 120 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'subject', headerName: 'Subject', width: 150 },
    { field: 'description', headerName: 'Description', width: 200 },
    { field: 'repairStatus', headerName: 'Repair Status', width: 140 },
    {
      field: 'workDone',
      headerName: 'Work Done',
      width: 110,
      renderCell: (params) => (
        <strong style={{ color: params.value === 'Yes' ? 'green' : 'red' }}>
          {params.value}
        </strong>
      )
    },
    { field: 'userName', headerName: 'Requested By', width: 130 },
    {
      field: 'billImage',
      headerName: 'Bill',
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewFile(params.value)}
          >
            View
          </Button>
        ) : (
          'N/A'
        ),
    },
    {
      field: 'review',
      headerName: 'Review',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleReviewClick(params.row)}
        >
          Review
        </Button>
      )
    },
  ];

  return (
    <div className="mechanic-container">
      <h2 className="mechanic-title">Verified Repair Requests</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <CircularProgress />
        </div>
      ) : (
        <div className="mechanic-table-wrapper">
          <div className="data-grid-wrapper">
            <DataGrid
              rows={requests}
              columns={columns}
              autoHeight
              pageSize={7}
              rowsPerPageOptions={[7, 10, 20]}
            />
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Repair Review</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <>
              <Typography className="dialog-text"><strong>Vehicle No:</strong> {selectedRequest.vehicleNo}</Typography>
              <Typography className="dialog-text"><strong>Description:</strong> {selectedRequest.description}</Typography>
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
              onClick={() => handleWorkCompleted(selectedRequest.id)}
            >
              Mark as Completed
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog
        open={filePreviewOpen}
        onClose={handleCloseFilePreview}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bill File Preview</DialogTitle>
        <DialogContent dividers>
          {fileToPreview?.type?.includes('pdf') ? (
            <iframe
              src={fileToPreview.url}
              title="PDF Preview"
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          ) : (
            <img
              src={fileToPreview?.url}
              alt="Bill File"
              style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 6 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default MechanicPendingRequests;
