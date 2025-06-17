import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField
} from '@mui/material';

const MechanicPendingRequests = ({ darkMode }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [files, setFiles] = useState({}); // report & bill
  const [statuses, setStatuses] = useState({});

  const fetchMechanicRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/mechanic'); // update URL as needed
      const requests = response.data.map((req, index) => ({
        ...req,
        id: req._id,
        slNo: index + 1,
        dateString: new Date(req.date).toLocaleDateString(),
      }));
      setRows(requests);
    } catch (error) {
      console.error('Error fetching mechanic requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanicRequests();
  }, []);

  const handleFileChange = (e, rowId, type) => {
    const file = e.target.files[0];
    setFiles((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [type]: file,
      },
    }));
  };

  const handleStatusChange = (e, rowId) => {
    const value = e.target.value;
    setStatuses((prev) => ({
      ...prev,
      [rowId]: value,
    }));
  };

  const handleSubmit = async (row) => {
    const formData = new FormData();
    if (files[row.id]?.report) formData.append('report', files[row.id].report);
    if (files[row.id]?.bill) formData.append('bill', files[row.id].bill);
    formData.append('status', statuses[row.id] || 'Pending');

    try {
      await axios.post(`http://localhost:5000/api/mechanic/${row._id}/submit`, formData); // update URL
      alert('Submitted successfully');
      fetchMechanicRequests(); // refresh
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Failed to submit');
    }
  };

  const columns = [
    { field: 'slNo', headerName: 'Sl No', flex: 0.5 },
    { field: 'dateString', headerName: 'Date', flex: 1 },
    {
      field: 'viewRequest',
      headerName: 'View Request',
      flex: 1.5,
      renderCell: (params) => (
        <Button
          variant="outlined"
          onClick={() => {
            setSelectedRow(params.row);
            setOpenDialog(true);
          }}
        >
          View
        </Button>
      ),
    },
    {
      field: 'uploadReport',
      headerName: 'Upload Report',
      flex: 2,
      renderCell: (params) => (
        <input
          type="file"
          accept=".pdf,.png,.jpg"
          onChange={(e) => handleFileChange(e, params.row.id, 'report')}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1.5,
      renderCell: (params) => (
        <TextField
          size="small"
          variant="outlined"
          defaultValue={params.row.status || 'Pending'}
          onChange={(e) => handleStatusChange(e, params.row.id)}
        />
      ),
    },
    {
      field: 'uploadBill',
      headerName: 'Upload Bill',
      flex: 2,
      renderCell: (params) => (
        <input
          type="file"
          accept=".pdf,.png,.jpg"
          onChange={(e) => handleFileChange(e, params.row.id, 'bill')}
        />
      ),
    },
    {
      field: 'submit',
      headerName: 'Submit',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSubmit(params.row)}
        >
          Submit
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Mechanic Pending Requests
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: darkMode ? '#424242' : '#f5f5f5',
              },
              '& .MuiDataGrid-cell': {
                borderRight: '1px solid rgba(224, 224, 224, 1)',
              },
            }}
          />
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Typography><strong>Sl No:</strong> {selectedRow.slNo}</Typography>
              <Typography><strong>Date:</strong> {selectedRow.dateString}</Typography>
              <Typography><strong>Status:</strong> {selectedRow.status || 'Pending'}</Typography>
              {/* Add more fields if available in the mechanic data */}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MechanicPendingRequests;
