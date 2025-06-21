import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Typography, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const RepairSectionAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  const fetchRequests = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/repair-request');
    const filtered = res.data.filter(req => req.status === 'forwarded_to_repair_section');
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

  const generateCertificates = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/repair-requests/${id}/generate-certificates`);
      alert('Certificates generated successfully!');
      setCertificateGenerated(true);
      setOpenDialog(false);
      fetchRequests();
    } catch (err) {
      console.error('Error generating certificates:', err);
      alert('Error generating certificates.');
    }
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'MTI Verified': color = 'info'; break;
      case 'SP Approved': color = 'success'; break;
      default: color = 'warning';
    }
    return <Chip label={status} color={color} variant="outlined" />;
  };

  const columns = [
    { field: 'id', headerName: 'Sl. No', flex: 0.5 },
    { field: 'pen', headerName: 'PEN No', flex: 1 },
    { field: 'date', headerName: 'DATE', flex: 1 },
    { field: 'subject', headerName: 'SUBJECT', flex: 1 },


    // seperately viewing bill

    
    //{
 // field: 'viewBill',
//headerName: 'View Final Bill',
//renderCell: (params) => (
  //params.row.finalBillFile ? (
    //<Button onClick={() => window.open(`data:${params.row.finalBillFile.contentType};base64,${params.row.finalBillFile.data}`, '_blank')}>
      //View Bill
    //</Button>
  //) : 'Not Uploaded'
//)
  //  }
,

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
      {/* Review Button */}
      <Button
        variant="outlined"
        color="info"
        onClick={() => {
          setSelectedEntry(params.row);
          setOpenDialog(true); // This dialog will be for review
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
          window.open(
            `data:${params.row.essentialityCertificate.contentType};base64,${params.row.essentialityCertificate.data}`,
            '_blank'
          )
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
          window.open(
            `data:${params.row.technicalCertificate.contentType};base64,${params.row.technicalCertificate.data}`,
            '_blank'
          )
        }
      >
        View
      </Button>
    ) : (
      'Pending'
    )
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Repair Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Typography><strong>PEN:</strong> {selectedEntry.pen}</Typography>
              <Typography><strong>DATE:</strong> {selectedEntry.date}</Typography>
              <Typography><strong>SUBJECT:</strong> {selectedEntry.subject}</Typography>
              <Typography><strong>STATUS:</strong> {selectedEntry.status}</Typography>
              {selectedEntry?.partsList?.length > 0 && (
  <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
    <Typography variant="h6" gutterBottom>Parts Required</Typography>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Sl No</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Item</th>
          <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Quantity</th>
        </tr>
      </thead>
      <tbody>
        {selectedEntry.partsList.map((part, idx) => (
          <tr key={idx}>
            <td style={{ padding: '6px' }}>{idx + 1}</td>
            <td style={{ padding: '6px' }}>{part.item}</td>
            <td style={{ padding: '6px' }}>{part.quantity}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Box>
)}
              {selectedEntry?.finalBillFile?.data && (
  <Box sx={{ gridColumn: '1 / -1' }}>
    <Typography variant="subtitle1" gutterBottom>
      Uploaded Bill:
    </Typography>
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
            onClick={() => generateCertificates(selectedEntry._id)}
            color="primary"
            variant="contained"
            disabled={certificateGenerated}
          >
            forward for approval
          </Button>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RepairSectionAdmin;
