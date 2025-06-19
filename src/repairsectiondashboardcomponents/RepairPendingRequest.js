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
      const res = await axios.get('http://localhost:5000/api/repair-requests/pending');
      setRequests(res.data || []);
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
    { field: 'userName', headerName: 'User Name', flex: 1 },
    {
      field: 'viewBill',
      headerName: 'View Bill',
      flex: 1,
      renderCell: (params) => (
        <Button onClick={() => window.open(params.row.billUrl, '_blank')}>
          View Bill
        </Button>
      )
    },
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
        <Button
          variant="outlined"
          onClick={() => {
            setSelectedEntry(params.row);
            setOpenDialog(true);
          }}
        >
          Review & Generate
        </Button>
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
              <Typography><strong>User Name:</strong> {selectedEntry.userName}</Typography>
              <Typography><strong>Description:</strong> {selectedEntry.description}</Typography>
              <Typography><strong>Status:</strong> {selectedEntry.status}</Typography>
              {selectedEntry.billUrl && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle1">Uploaded Bill:</Typography>
                  <iframe src={selectedEntry.billUrl} width="100%" height="400px" title="Bill" />
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
            Generate Certificates
          </Button>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RepairSectionAdmin;
