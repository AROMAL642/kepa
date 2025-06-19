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
  const [workDoneChoice, setWorkDoneChoice] = useState('');
  const [partsList, setPartsList] = useState([{ slNo: '', partName: '', qty: '' }]);
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
    setPartsList([{ slNo: '', partName: '', qty: '' }]);
    setBillFile(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };

  const handleWorkCompleted = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/repairs/${selectedRequest.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workDone: 'Yes' })
      });
      await res.json();
      setRequests(prev => prev.map(r => (r.id === selectedRequest.id ? { ...r, workDone: 'Yes' } : r)));
      setModalOpen(false);
    } catch (err) {
      console.error('Error marking work done:', err);
    }
  };

  const handlePartsSubmit = async () => {
    const payload = {
      mechanicFeedback: '',
      needsParts: true,
      partsList,
    };

    if (billFile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        payload.billFile = {
          data: reader.result.split(',')[1],
          contentType: billFile.type
        };

        await fetch(`http://localhost:5000/api/repairs/${selectedRequest.id}/mechanic-update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        setModalOpen(false);
      };
      reader.readAsDataURL(billFile);
    } else {
      await fetch(`http://localhost:5000/api/repairs/${selectedRequest.id}/mechanic-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setModalOpen(false);
    }
  };

  const handlePartChange = (index, key, value) => {
    const updated = [...partsList];
    updated[index][key] = value;
    setPartsList(updated);
  };

  const addPartRow = () => {
    setPartsList([...partsList, { slNo: '', partName: '', qty: '' }]);
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
                        label="Sl No"
                        size="small"
                        value={part.slNo}
                        onChange={(e) => handlePartChange(idx, 'slNo', e.target.value)}
                      />
                      <TextField
                        label="Part Name"
                        size="small"
                        value={part.partName}
                        onChange={(e) => handlePartChange(idx, 'partName', e.target.value)}
                      />
                      <TextField
                        label="Quantity"
                        size="small"
                        type="number"
                        value={part.qty}
                        onChange={(e) => handlePartChange(idx, 'qty', e.target.value)}
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
          {workDoneChoice === 'yes' && (
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
    </div>
  );
}

export default MechanicPendingRequests;
