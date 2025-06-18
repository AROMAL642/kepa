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
  const [files, setFiles] = useState({});
  const [statuses, setStatuses] = useState({});

  const fetchMechanicRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/mechanic/approved');
      const requests = response.data.map((req, index) => {
        const status = req.status || 'Pending';
        return {
          ...req,
          id: req._id,
          slNo: index + 1,
          dateString: new Date(req.date).toLocaleDateString(),
          status,
        };
      });

      setRows(requests);

      // Initialize statuses
      const initialStatuses = {};
      requests.forEach((req) => {
        initialStatuses[req._id] = req.status;
      });
      setStatuses(initialStatuses);
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

    if (!files[row.id]?.report || !files[row.id]?.bill) {
      alert('Please upload both report and bill before submitting.');
      return;
    }

    formData.append('report', files[row.id].report);
    formData.append('bill', files[row.id].bill);
    formData.append('status', statuses[row.id] || 'Pending');

    try {
      await axios.post(`http://localhost:5000/api/mechanic/${row._id}/submit`, formData);
      alert('Submitted successfully');
      fetchMechanicRequests();
    } catch (err) {
      console.error('Submit failed:', err);
      alert('Failed to submit');
    }
  };

  const columns = [
    { field: 'slNo', headerName: 'Sl No', flex: 0.5 },
    { field: 'vehicleNo', headerName: 'Vehicle No', flex: 1 },
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
        <Box>
          <input
            type="file"
            accept=".pdf,.png,.jpg"
            onChange={(e) => handleFileChange(e, params.row.id, 'report')}
          />
          {files[params.row.id]?.report && (
            <Typography variant="body2">{files[params.row.id].report.name}</Typography>
          )}
        </Box>
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
          value={statuses[params.row.id] || 'Pending'}
          onChange={(e) => handleStatusChange(e, params.row.id)}
        />
      ),
    },
    {
      field: 'uploadBill',
      headerName: 'Upload Bill',
      flex: 2,
      renderCell: (params) => (
        <Box>
          <input
            type="file"
            accept=".pdf,.png,.jpg"
            onChange={(e) => handleFileChange(e, params.row.id, 'bill')}
          />
          {files[params.row.id]?.bill && (
            <Typography variant="body2">{files[params.row.id].bill.name}</Typography>
          )}
        </Box>
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
        Mechanic Requests
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
              <Typography><strong>Vehicle No:</strong> {selectedRow.vehicleNo}</Typography>
              {/* Add more fields as needed */}
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
