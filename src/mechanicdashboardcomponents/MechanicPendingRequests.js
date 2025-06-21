import React, { useEffect, useState } from 'react';
import {
  DataGrid
} from '@mui/x-data-grid';
import {
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField
} from '@mui/material';

function MechanicPendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState(null);
  const [workDoneChoice, setWorkDoneChoice] = useState('');
  const [partsList, setPartsList] = useState([{ item: '', quantity: '' }]);
  const [billFile, setBillFile] = useState(null);

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
    setWorkDoneChoice('');
    setPartsList([{ item: '', quantity: '' }]);
    setBillFile(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleWorkCompleted = () => {
    fetch(`http://localhost:5000/api/repairs/${selectedRequest.id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workDone: 'Yes' })
    })
      .then((res) => res.json())
      .then((updated) => {
        if (!updated || !updated._id) {
          alert('Update failed.');
          return;
        }
        setRequests((prev) =>
          prev.map((r) =>
            r.id === selectedRequest.id
              ? {
                  ...r,
                  workDone: 'Yes',
                  repairStatus: 'completed'
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

  // ✅ Add Part Row Function
  const addPartRow = () => {
    setPartsList(prev => [...prev, {  item: '', quantity: '' }]);
  };

  // ✅ Handle Part Input Change
  const handlePartChange = (index, field, value) => {
    const updated = [...partsList];
    updated[index][field] = value;
    setPartsList(updated);
  };

  // ✅ Submit Parts Request Handler
  const handlePartsSubmit = async () => {
    if (!selectedRequest) return;
    const formData = {
      mechanicFeedback: '',
      needsParts: true,
       partsList: partsList.map(p => ({
    item: p.item,          // ✅ correct field
    quantity: parseInt(p.quantity)  // ✅ convert quantity to number
  })),
      billFile: null
    };

    if (billFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result.split(',')[1];
        formData.billFile = {
          data: base64Data,
          contentType: billFile.type
        };

        await sendPartsRequest(formData);
      };
      reader.readAsDataURL(billFile);
    } else {
      await sendPartsRequest(formData);
    }
  };

  const sendPartsRequest = async (formData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-request/${selectedRequest.id}/mechanic-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Parts request submitted');
        handleCloseModal();
      } else {
        alert('Failed to submit parts request');
      }
    } catch (err) {
      console.error('Error submitting parts request:', err);
      alert('Error submitting parts request');
    }
  };

  const columns = [
    { field: 'serial', headerName: '#', width: 50 },
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
        )
    },
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
    }
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
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Repair Review</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedRequest.vehicleNo}</Typography>
              <Typography><strong>Description:</strong> {selectedRequest.description}</Typography>

              <Typography sx={{ mt: 2 }}><strong>Is Work Done?</strong></Typography>
              <RadioGroup
                row
                value={workDoneChoice}
                onChange={(e) => setWorkDoneChoice(e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>

              {workDoneChoice === 'no' && (
                <>
                  <Typography sx={{ mt: 2 }}><strong>Parts Required</strong></Typography>
                  {partsList.map((part, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      
                      <TextField
                        label="Item"
                        size="small"
                        value={part.item}
                        onChange={(e) => handlePartChange(idx, 'item', e.target.value)}
                      />
                      <TextField
                        label="Quantity"
                        size="small"
                        type="number"
                        value={part.quantity}
                        onChange={(e) => handlePartChange(idx, 'quantity', e.target.value)}
                      />
                    </div>
                  ))}
                  <Button sx={{ mt: 1 }} onClick={addPartRow}>+ Add More</Button>

                  <Typography sx={{ mt: 2 }}><strong>Upload Bill</strong></Typography>
                  <input type="file" onChange={(e) => setBillFile(e.target.files[0])} />
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
          {selectedRequest?.workDone !== 'Yes' && (
            <Button variant="contained" color="success" onClick={handleWorkCompleted}>
              Work Completed
            </Button>
          )}
          {workDoneChoice === 'no' && (
            <Button variant="contained" color="warning" onClick={handlePartsSubmit}>
              Submit Parts Request
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={filePreviewOpen} onClose={handleCloseFilePreview} maxWidth="md" fullWidth>
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
