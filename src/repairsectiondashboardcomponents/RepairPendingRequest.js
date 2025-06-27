import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Typography, Chip, TextField
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const RepairSectionAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  // Sanction dialog
  const [sanctionDialogOpen, setSanctionDialogOpen] = useState(false);
  const [approvedNo, setApprovedNo] = useState('');
  const [sanctionBillFile, setSanctionBillFile] = useState(null);
   const [sanctionedIds, setSanctionedIds] = useState(new Set());

const [additionalBill, setAdditionalBill] = useState(null);
const [isEditingParts, setIsEditingParts] = useState(false);

  


  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/repair-request');
      const filtered = res.data.filter(req =>
        ['forwarded_to_repair_section', 'for_generating_certificate', 'generating_certificates', 'certificate_ready', 'waiting_for_sanction', 
    'sanctioned_for_work','ongoing_work' , 'work completed', 'Pending User verification', 'completed' ,].includes(req.status)
      );
      setRequests(filtered);
    } catch (err) {
      console.error('Error fetching repair requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const forwardToMainAdmin = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/repair-request/${id}/forward-to-certificates`);
      alert('Request forwarded to Main Admin for generating certificates.');
      setCertificateGenerated(true);
      setOpenDialog(false);
      fetchRequests();
    } catch (err) {
      console.error('Error forwarding to main admin:', err);
      alert('Failed to forward request.');
    }
  };

  const sendForApproval = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/repair-request/${id}/send-for-approval`);
      alert('✅ Sent for approval');
      fetchRequests();
    } catch (err) {
      console.error('Error sending for approval:', err);
      alert('❌ Failed to send');
    }
  };

  const forwardSanction = async (id) => {
    const formData = new FormData();
    //formData.append('approvedNo', approvedNo);
   formData.append('additionalBill', additionalBill);



    try {
      await axios.put(`http://localhost:5000/api/repair-request/${id}/sanction-work`, formData);
      alert('✅ Sanction forwarded to Main Admin');
      setSanctionDialogOpen(false);
        setAdditionalBill(null);
    
      fetchRequests();
    } catch (err) {
      console.error('Error forwarding sanction:', err);
      alert('❌ Failed to forward sanction');
    }
  };

  const handlePartFieldChange = (index, field, value) => {
  const updatedParts = [...selectedEntry.partsList];
  updatedParts[index][field] = value;
  setSelectedEntry({ ...selectedEntry, partsList: updatedParts });
};

const updatePartsDetails = async (id, updatedPartsList) => {
  try {
    const response = await fetch(`http://localhost:5000/api/repair-request/${id}/update-parts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ partsList: updatedPartsList }),
    });

    if (!response.ok) throw new Error('Failed to update');

    alert('✅ Parts details updated successfully');
  } catch (error) {
    console.error('❌ Error updating parts:', error);
    alert('❌ Failed to save parts details');
  }
};





  const getStatusChip = (status) => {
    let color;
    let label = status;
    switch (status) {
      case 'verified': color = 'info'; label = 'Verified'; break;
      case 'forwarded_to_mechanic': color = 'warning'; break;
      case 'sent_to_MTI': color = 'secondary'; break;
      case 'for_generating_certificate': color = 'warning'; break;
      case 'generating_certificates': color = 'info'; break;
      case 'certificate_ready': color = 'success'; label = 'Certificates Ready'; break;
      case 'waiting_for_sanction': color = 'warning'; label = 'Waiting for Sanction'; break;
      case 'sanctioned_for_work': color = 'success'; label = 'Sanctioned'; break;
      case 'ongoing_work': color = 'success'; label = 'ongoing work '; break;
      case 'Pending User Verification': color = 'success'; label = 'Pending User Verification'; break;
case 'work_complete': color = 'success'; label = 'work_complete '; break;

case 'completed': color = 'success'; label = 'completed '; break;








      default: color = 'default';
    }
    return <Chip label={label} color={color} variant="outlined" />;
  };

  const columns = [
    { field: 'id', headerName: 'Sl. No', flex: 0.5 },
    { field: 'pen', headerName: 'PEN No', flex: 1 },
    { field: 'date', headerName: 'DATE', flex: 1 },
    { field: 'subject', headerName: 'SUBJECT', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => getStatusChip(params.value)
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="info"
            onClick={() => {
              setSelectedEntry(params.row);
              setCertificateGenerated(false);
              setOpenDialog(true);
            }}
          >
            Review
          </Button>
        </Box>
      )
    },
    {
      field: 'essentialityCertificate',
      headerName: 'Essentiality Certificate',
      flex: 1,
      renderCell: (params) =>
        params.row.essentialityCertificate?.data ? (
          <Button
            variant="outlined"
            onClick={() =>
              window.open(`http://localhost:5000/api/repair-request/${params.row._id}/view-ec`, '_blank')
            }
          >
            View
          </Button>
        ) : (
          'Pending'
        )
    },
    {
      field: 'technicalCertificate',
      headerName: 'Technical Certificate',
      flex: 1,
      renderCell: (params) =>
        params.row.technicalCertificate?.data ? (
          <Button
            variant="outlined"
            onClick={() =>
             window.open(`http://localhost:5000/api/repair-request/${params.row._id}/view-tc`, '_blank')
            }
          >
            View
          </Button>
        ) : (
          'Pending'
        )
    },
    {
      field: 'sendApproval',
      headerName: 'Send for Approval',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          disabled={params.row.status !== 'certificate_ready'}
          onClick={() => sendForApproval(params.row._id)}
        >
          SEND
        </Button>
      )
    },
    {
      field: 'sanctionApproval',
      headerName: 'Sanction for Work',
      flex: 1.2,
      renderCell: (params) => {
        const isSanctioned = params.row.status === 'sanctioned_for_work';
        const isWaiting = params.row.status === 'waiting_for_sanction';
        return (
          <Button
            variant={isSanctioned ? 'contained' : 'outlined'}
            color={isSanctioned ? 'success' : 'primary'}
            disabled={!isWaiting || sanctionedIds.has(params.row._id)}
            onClick={() => {
              setSelectedEntry(params.row);
              setSanctionDialogOpen(true);
            }}
          >
            APPROVE
          </Button>
        );
      }
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Repair Section - Pending Requests
      </Typography>
      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={requests.map((req, i) => ({ ...req, id: i + 1 }))}
          columns={columns}
          pageSize={10}
          disableSelectionOnClick
        />
      </Box>

      {/* Dialog for viewing request details */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Repair Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Typography><strong>PEN:</strong> {selectedEntry.pen}</Typography>
              <Typography><strong>DATE:</strong> {selectedEntry.date}</Typography>
              <Typography><strong>SUBJECT:</strong> {selectedEntry.subject}</Typography>
              
              


              {selectedEntry?.partsList?.length > 0 && (
                
  <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>


  <TextField
    fullWidth
    label="TC Serial Number"
    value={selectedEntry.tcSerialNumber || ''}
    onChange={(e) =>
      setSelectedEntry({ ...selectedEntry, tcSerialNumber: e.target.value })
    }
    sx={{ mb: 1 }}
  />
  <Button
    variant="contained"
    onClick={async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/repair-request/${selectedEntry._id}/update-tc-serial`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tcSerialNumber: selectedEntry.tcSerialNumber }),
          }
        );

        if (!response.ok) throw new Error('Failed to update');

        alert('✅ TC Serial Number saved successfully');
      } catch (err) {
        console.error(err);
        alert('❌ Failed to save TC Serial Number');
      }
    }}
  >
    Save TC Serial Number
  </Button>

















    <Typography variant="h6" gutterBottom>Replacement Statement of Spares</Typography>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Sl No</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Item</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Quantity</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Previous Date</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Previous MR</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>KM After Replace</th>
        </tr>
      </thead>
      <tbody>
        {selectedEntry.partsList.map((part, idx) => (
          <tr key={idx}>
            <td style={{ padding: '6px' }}>{idx + 1}</td>
            <td style={{ padding: '6px' }}>{part.item}</td>
            <td style={{ padding: '6px' }}>{part.quantity}</td>

            {isEditingParts ? (
              <>
                <td><input type="text" value={part.previousDate || ''} onChange={(e) => handlePartFieldChange(idx, 'previousDate', e.target.value)} /></td>
                <td><input type="text" value={part.previousMR || ''} onChange={(e) => handlePartFieldChange(idx, 'previousMR', e.target.value)} /></td>
                <td><input type="text" value={part.kmAfterReplacement || ''} onChange={(e) => handlePartFieldChange(idx, 'kmAfterReplacement', e.target.value)} /></td>
              </>
            ) : (
              <>
                <td style={{ padding: '6px' }}>{part.previousDate || '—'}</td>
                <td style={{ padding: '6px' }}>{part.previousMR || '—'}</td>
                <td style={{ padding: '6px' }}>{part.kmAfterReplacement || '—'}</td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>

    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
      {isEditingParts ? (
        <>
          <Button
            variant="contained"
            onClick={() => {
              updatePartsDetails(selectedEntry._id, selectedEntry.partsList);
              setIsEditingParts(false);
            }}
          >
            Save Parts Details
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setIsEditingParts(false)}
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          variant="outlined"
          onClick={() => setIsEditingParts(true)}
        >
          Edit
        </Button>
      )}
    </Box>
  </Box>
)}


              {selectedEntry?.finalBillFile?.data && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle1" gutterBottom>Uploaded Bill:</Typography>
                  {selectedEntry.finalBillFile.contentType.includes('pdf') ? (
                    <iframe
                      src={`data:${selectedEntry.finalBillFile.contentType};base64,${selectedEntry.finalBillFile.data}`}
                      width="100%"
                      height="500px"
                      style={{ border: '1px solid #ccc', borderRadius: 4 }}
                      title="Bill Preview"
                    />
                  ) : (
                    <img
                      src={`data:${selectedEntry.finalBillFile.contentType};base64,${selectedEntry.finalBillFile.data}`}
                      alt="Final Bill"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '500px',
                        display: 'block',
                        margin: '0 auto',
                        objectFit: 'contain',
                        borderRadius: '6px',
                        border: '1px solid #ccc'
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
  onClick={() => forwardToMainAdmin(selectedEntry._id)}
  color="primary"
  variant="contained"
  disabled={selectedEntry?.status !== 'forwarded_to_repair_section' || certificateGenerated}
>
  Forward for Approval
</Button>

          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Sanction Dialog */}
       <Dialog open={sanctionDialogOpen} maxWidth="lg" fullWidth onClose={() => setSanctionDialogOpen(false)}>
        <DialogTitle>Sanction for Work</DialogTitle>
        <DialogContent>
          <Box>
            <Typography>Upload Sanction Bill:</Typography>
             <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={(e) => setAdditionalBill(e.target.files[0])}
      />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => forwardSanction(selectedEntry._id)} variant="contained">FORWARD</Button>
          <Button onClick={() => setSanctionDialogOpen(false)}>CANCEL</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RepairSectionAdmin;

