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
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const MechanicRepairList = ({ darkMode }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [workDone, setWorkDone] = useState({});

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forwaded');
      const data = res.data.map((req, index) => ({
        ...req,
        id: req._id,
        slNo: index + 1,
        dateString: new Date(req.date).toLocaleDateString(),
      }));
      setRows(data);

      const initStatus = {};
      const initWork = {};
      data.forEach((req) => {
        initStatus[req._id] = req.status || 'Pending';
        initWork[req._id] = 'No';
      });
      setStatuses(initStatus);
      setWorkDone(initWork);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = (e, rowId) => {
    setStatuses((prev) => ({
      ...prev,
      [rowId]: e.target.value,
    }));
  };

  const handleWorkDoneChange = (e, rowId) => {
    const value = e.target.value;
    setWorkDone((prev) => ({
      ...prev,
      [rowId]: value,
    }));

    if (value === 'Yes') {
      alert('Message sent to user for verification');
      setStatuses((prev) => ({ ...prev, [rowId]: 'Verification Pending' }));
    } else {
      alert('Message sent to MTI to check again');
      setStatuses((prev) => ({ ...prev, [rowId]: 'Check Again' }));
    }
  };

  const columns = [
    { field: 'slNo', headerName: 'Sl No', flex: 0.5 },
    { field: 'vehicleNo', headerName: 'Vehicle No', flex: 1 },
    { field: 'penNo', headerName: 'Pen No', flex: 1 },
    { field: 'dateString', headerName: 'Request Date', flex: 1 },
    {
      field: 'billView',
      headerName: 'Bill',
      flex: 1,
      renderCell: (params) =>
        params.row.billUrl ? (
          <IconButton onClick={() => window.open(params.row.billUrl, '_blank')} color="primary">
            <VisibilityIcon />
          </IconButton>
        ) : (
          <Typography variant="body2">N/A</Typography>
        ),
    },
    {
      field: 'workDone',
      headerName: 'Work Done?',
      flex: 1,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          value={workDone[params.row.id] || 'No'}
          onChange={(e) => handleWorkDoneChange(e, params.row.id)}
        >
          <MenuItem value="Yes">Yes</MenuItem>
          <MenuItem value="No">No</MenuItem>
        </TextField>
      ),
    },
    {
      field: 'status',
      headerName: 'Repair Status',
      flex: 1.5,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          value={statuses[params.row.id] || 'Pending'}
          onChange={(e) => handleStatusChange(e, params.row.id)}
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Repaired">Repaired</MenuItem>
          <MenuItem value="Parts Required">Parts Required</MenuItem>
          <MenuItem value="Check Again">Check Again</MenuItem>
          <MenuItem value="Verification Pending">Verification Pending</MenuItem>
          <MenuItem value="Verified">Verified</MenuItem>
        </TextField>
      ),
    },
    {
      field: 'view',
      headerName: 'Details',
      flex: 1,
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
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Mechanic Repair Tasks
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
            rowsPerPageOptions={[10, 25]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: darkMode ? '#333' : '#f5f5f5',
              },
            }}
          />
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Repair Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Typography><strong>Sl No:</strong> {selectedRow.slNo}</Typography>
              <Typography><strong>Date:</strong> {selectedRow.dateString}</Typography>
              <Typography><strong>Status:</strong> {selectedRow.status || 'Pending'}</Typography>
              <Typography><strong>Vehicle No:</strong> {selectedRow.vehicleNo}</Typography>
              <Typography><strong>Pen No:</strong> {selectedRow.penNo || 'N/A'}</Typography>
              <Typography><strong>Description:</strong> {selectedRow.description}</Typography>
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

export default MechanicRepairList;
