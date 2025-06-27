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
  TextField,
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
  const [workDoneChoice, setWorkDoneChoice] = useState('');
  const [partsList, setPartsList] = useState([{ item: '', quantity: '' }]);
  const [billFile, setBillFile] = useState(null);
const [sentRequests, setSentRequests] = useState([]);
const [mechanicUploadFile, setMechanicUploadFile] = useState(null);


const [verifyModalOpen, setVerifyModalOpen] = useState(false);
const [verifyRequest, setVerifyRequest] = useState(null);
const [verifyFile, setVerifyFile] = useState(null);
const [showReverifyDialog, setShowReverifyDialog] = useState(false);
const [reverifyTargetId, setReverifyTargetId] = useState(null);
const [reverifyReason, setReverifyReason] = useState('');
const [expense, setExpense] = useState('');
const [workerWage, setWorkerWage] = useState('');

  const theme = useTheme(); // ✅ added
  const fullScreen = useMediaQuery(theme.breakpoints.down('md')); // ✅ added


  
  useEffect(() => {
    fetch('http://localhost:5000/api/repair-request')
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
          status: req.status,
          mechanicFeedback: req.mechanicFeedback,
          workDone: req.workDone || 'No',
          userApproval: req.userApproval || false,
          rejectedByUser: req.rejectedByUser || false,
          userRemarks: req.userRemarks || '',
           
 
          billImage: req.billFile
            ? {
                url: `data:${req.billFile.contentType};base64,${req.billFile.data}`,
                type: req.billFile.contentType
              }
            : null,
            expense: req.expense || 'N/A',
  workerWage: req.workerWage || 'N/A',
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

const openReverifyDialog = (row) => {
  setReverifyTargetId(row.id);
  setReverifyReason(row.userRemarks || '');
  setShowReverifyDialog(true);
};



const confirmReverify = () => {
  handleReverify(reverifyTargetId);
  setShowReverifyDialog(false);
};












  const handleWorkCompleted = async () => {
  const currentStatus = selectedRequest.status;

  // ✅ Logic: if status is "forwarded", set workDone to 'No' so user will verify
  const updatedWorkDone = currentStatus === 'forwarded' ? 'No' : 'Yes';
  const nextStatus = currentStatus === 'forwarded' ? 'Pending User Verification' : 'completed';

  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${selectedRequest.id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workDone: updatedWorkDone,
        status: nextStatus
      })
    });

    if (!res.ok) throw new Error('Failed to update status.');

    const updated = await res.json();

    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? {
              ...r,
              workDone: updatedWorkDone,
              repairStatus: nextStatus,
              status: nextStatus
            }
          : r
      )
    );

    // ✅ Notify user only if forwarded-to-verification flow
    if (nextStatus === 'Pending User Verification') {
      await notifyUserForVerification(selectedRequest.id);
    }

    alert('✔️ Status updated and sent to user for verification.');
    handleCloseModal();
  } catch (err) {
    console.error('Error:', err);
    alert('❌ Failed to update request.');
  }
};


const notifyUserForVerification = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${id}/send-to-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('User notification failed.');
    console.log('✅ User notified for verification.');
  } catch (err) {
    console.error('User notify error:', err);
  }
};



  const handleViewFile = (file) => {
    setFileToPreview(file);
    setFilePreviewOpen(true);
  };

  const handleCloseFilePreview = () => {
    setFileToPreview(null);
    setFilePreviewOpen(false);
  };

  const addPartRow = () => {
    setPartsList(prev => [...prev, { item: '', quantity: '' }]);
  };

  const handlePartChange = (index, field, value) => {
    const updated = [...partsList];
    updated[index][field] = value;
    setPartsList(updated);
  };

  const handlePartsSubmit = async () => {
    if (!selectedRequest) return;
    const formData = {
      mechanicFeedback: '',
      needsParts: true,
      partsList: partsList.map(p => ({
        item: p.item,
        quantity: parseInt(p.quantity)
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

const handleSendToUser = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${id}/send-to-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to notify user');

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Pending User Verification' } : r
      )
    );

    // ✅ Track sent ones (optional, in case you want both logic paths)
    setSentRequests((prev) => [...prev, id]);


    alert('Sent to user for verification');
    setSentRequests((prev) => [...prev, id]);  // ✅ Track as sent
  } catch (err) {
    console.error(err);
    alert('Error notifying user');
  }
};

// from user after workdone =yes
const handleUserApproved = async (id) => {
  const file = window.prompt('Attach final bill (optional - skip to continue)'); // replace with file dialog if needed

  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed', finalBill: file || '' }) // adjust payload as needed
    });

    if (!res.ok) throw new Error('Failed to forward to admin');

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'completed' } : r
      )
    );

    alert('✔️ Forwarded to admin as completed');
  } catch (err) {
    console.error(err);
    alert('Error forwarding to admin');
  }
};

// from user after work done =no

const handleReverify = async (id) => {
  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${id}/send-to-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to re-send to user');

    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'Pending User Verification', rejectedByUser: false } : r
      )
    );

    alert('🔁 Sent back to user for re-verification');
  } catch (err) {
    console.error(err);
    alert('Re-send failed');
  }
};


// mechanic send to MTI Admin after work completed

const openVerifyModal = (row) => {
  setVerifyRequest(row);
  setExpense(row.expense || '');
  setVerifyFile(null);
  setVerifyModalOpen(true);
};

const handleForwardToMTI = async () => {
  if (!verifyRequest) return alert("Missing request information.");

  const formData = new FormData();
  formData.append("workDone", "Yes");
  formData.append("status", "completed");

  if (verifyFile) {
    formData.append("verifiedWorkBill", verifyFile); // ✅ upload bill
  }

if (expense !== '') {
  formData.append("expense", Number(expense)); // ✅ changed to number
}
if (workerWage !== '') {
  formData.append("workerWage", Number(workerWage)); // ✅ changed to number
}





  try {
    const res = await fetch(`http://localhost:5000/api/repair-request/${verifyRequest.id}/complete`, {
      method: 'PATCH',
      body: formData, // ✅ send FormData directly, no headers
    });

    if (res.ok) {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === verifyRequest.id
            ? { ...r, status: "completed", workDone: "Yes" }
            : r
        )
      );
      alert("✅ Forwarded to MTI with bill!");
      setVerifyModalOpen(false);
    } else {
      const data = await res.json();
      alert(`❌ Failed to forward to MTI: ${data?.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error("Error forwarding to MTI:", err);
    alert("Error forwarding to MTI.");
  }
};










  const columns = [
    { field: 'serial', headerName: '#', width: 60 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 120 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    { field: 'date', headerName: 'Date', width: 110 },
    { field: 'subject', headerName: 'Subject', width: 150 },
    { field: 'description', headerName: 'Description', width: 200 },
   {
  field: 'status',
  headerName: 'Status',
  width: 150,
  renderCell: (params) => {
    let color = 'black';

    switch (params.value) {
      case 'completed':
        color = 'green';
        break;
      case 'ongoing_work':
        color = 'orange';
        break;
      case 'sanctioned_for_work':
        color = 'purple';
        break;
      case 'certificate_ready':
        color = '#007bff'; // bootstrap blue
        break;
      case 'forwarded':
      case 'sent_to_MTI':
        color = '#6c757d'; // gray
        break;
      default:
        color = 'black';
    }

    return <strong style={{ color }}>{params.value}</strong>;
  }
}
,

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
    //{ field: 'userName', headerName: 'Requested By', width: 130 },
   {
  field: 'billImage',
  headerName: 'Bill',
  width: 100,
  renderCell: (params) => {
    const { status, billImage } = params.row;

    const isAllowed =
      [
        'forwarded',
        'ongoing_work',
        'completed',
        'certificate_ready',
        'sent_to_MTI',
        'Pending User Verification',
        'awaiting_user_verification',
        'work_complete'
      ].includes(status);

    return (
      <Button
        variant="outlined"
        size="small"
        disabled={!billImage || !isAllowed}
        onClick={() => handleViewFile(billImage)}
      >
        View
      </Button>
    );
  }
}

,
   {
  field: 'review',
  headerName: 'Review',
  width: 120,
  renderCell: (params) => {
    const { status } = params.row;

    return (
      <Button
        variant="contained"
        color="primary"
        size="small"
        disabled={status !== 'forwarded'} // ✅ Enabled only when status is 'forwarded'
        onClick={() => handleReviewClick(params.row)}
      >
        Review
      </Button>
    );
  }
}

,

   {
  field: 'sendToUser',
  headerName: 'Send to User',
  width: 160,
  renderCell: (params) => {
    const { id, status, workDone } = params.row;

    const sentStatuses = [
      
      'Pending User Verification',
      'work completed',
      'Check Again',
      'completed',
      
    ];

    // ✅ Show green Sent ✓ if already sent
   if (sentStatuses.includes(status)) {
      return (
        <Button
          variant="contained"
          color="success"
          size="small"
          disabled
          startIcon={<span style={{ fontWeight: 'bold', fontSize: '16px' }}>✓</span>}
        >
          Send
        </Button>
      );
    }

    // ✅ Show Send button if allowed
    if (status === 'ongoing_work' && workDone !== 'Yes') {
      return (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => handleSendToUser(id)}
        >
          Sent
        </Button>
      );
    }

    // ✅ Default fallback — N/A
    return <span style={{ color: 'gray' }}>N/A</span>;
  }
},
{
  field: 'userVerification',
  headerName: 'Work Verification by User',
  width: 250,
  renderCell: (params) => {
    const { userApproval, rejectedByUser, id , status} = params.row;

 if (status === 'completed' && userApproval) {
      return (
        <span style={{ color: 'green', fontWeight: 'bold' }}>
          ✓ Work Verified
        </span>
      );
    }




    if (userApproval) {
      return (
        <Button
  variant="contained"
  color="success"
  size="small"
  onClick={() => openVerifyModal(params.row)} // 🔁 trigger modal open
>
  work verified
</Button>

      );
    }
if (rejectedByUser) {
  return (
    <>
      <Button
        variant="contained"
        color="error"
        size="small"
            onClick={() => openReverifyDialog(params.row)}
       
      >
        Re-verify
      </Button>
      {params.row.userRemarks && (
        <Typography sx={{ fontSize: '12px', color: 'gray', mt: 1 }}>
          ❗ Reason: {params.row.userRemarks}
        </Typography>
      )}
    </>
  );
}


    return <span style={{ color: 'gray' }}>Awaiting Response</span>;
  }

}













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
      <Dialog open={filePreviewOpen} onClose={handleCloseFilePreview} maxWidth="md" fullWidth>
  <DialogTitle>Uploaded Bill Preview</DialogTitle>
  <DialogContent dividers>
    {fileToPreview ? (
      fileToPreview.type.startsWith('image/') ? (
        <img
          src={fileToPreview.url}
          alt="Uploaded Image"
          style={{ maxWidth: '100%', maxHeight: '500px', display: 'block', margin: 'auto' }}
        />
      ) : fileToPreview.type === 'application/pdf' ? (
        <iframe
          src={fileToPreview.url}
          title="Bill PDF"
          width="100%"
          height="500"
          style={{ border: 'none' }}
        />
      ) : (
        <Typography color="error">Unsupported file format</Typography>
      )
    ) : (
      <Typography>No file found to preview</Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseFilePreview}>Close</Button>
  </DialogActions>
</Dialog>

      {/* Modal for Review */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Repair Review</DialogTitle>
        <DialogContent dividers>
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

      {/* File Preview Dialog */}
      <Dialog
  open={verifyModalOpen}
  onClose={() => setVerifyModalOpen(false)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>User Work Verification</DialogTitle>
<DialogContent dividers>
  <Typography sx={{ mb: 2 }}><strong>Work Done:</strong> Yes</Typography>
  <Typography sx={{ mb: 1 }}>✅ User has verified the work completed.</Typography>

  <Typography sx={{ mt: 2 }}><strong>Upload Verified Work Bill</strong></Typography>
  <input
    type="file"
    accept="application/pdf,image/*"
    onChange={(e) => setVerifyFile(e.target.files[0])}
  />

  <TextField
    label="Expense (in ₹)"
    type="number"
    fullWidth
    sx={{ mt: 2 }}
    value={expense}
onChange={(e) => setExpense(Number(e.target.value))}

  />

  <TextField
  label="Worker Wage (in ₹)"
  type="number"
  fullWidth
  sx={{ mt: 2 }}
  value={workerWage}
  onChange={(e) => setWorkerWage(Number(e.target.value))}

/>



</DialogContent>
<DialogActions>
  <Button onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
  <Button variant="contained" color="success" onClick={handleForwardToMTI}>
    Forward to MTI
  </Button>
</DialogActions>


</Dialog>


<Dialog open={showReverifyDialog} onClose={() => setShowReverifyDialog(false)}>
  <DialogTitle>Confirm Re-Verification</DialogTitle>
  <DialogContent dividers>
    <Typography gutterBottom>
      Are you sure you want to send this back for re-verification?
    </Typography>

    {reverifyReason && (
      <Typography sx={{ mt: 2, color: 'red' }}>
        <strong>User Remark:</strong> {reverifyReason}
      </Typography>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowReverifyDialog(false)}>Cancel</Button>
    <Button variant="contained" color="error" onClick={confirmReverify}>
      Confirm Re-Verify
    </Button>
  </DialogActions>
</Dialog>






    </div>
  );
}

export default MechanicPendingRequests;
