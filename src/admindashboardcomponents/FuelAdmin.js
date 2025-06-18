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
  Chip
} from '@mui/material';
import FuelAdmin2 from './FuelAdmin2'; // ✅ Import directly

const FuelAdmin = ({ darkMode }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showAll, setShowAll] = useState(false); // ✅ View toggle

  const fetchFuelData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/fuel');
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Error fetching fuel data:', error);
      setError('Failed to load fuel data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelData();
  }, []);

  const handleStatusUpdate = async (entry, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/fuel/${entry.vehicleNo}/${entry._id}`,
        { status: newStatus }
      );
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) =>
          vehicle.vehicleNo === entry.vehicleNo
            ? {
                ...vehicle,
                fuelEntries: vehicle.fuelEntries.map((e) =>
                  e._id === entry._id ? { ...e, status: newStatus } : e
                )
              }
            : vehicle
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Error updating status');
    }
  };

  const allEntries = vehicles.flatMap((vehicle) =>
    vehicle.fuelEntries
      .filter((entry) => (entry.status || 'Pending').toLowerCase() === 'pending')
      .map((entry) => ({
        ...entry,
        id: entry._id,
        vehicleNo: vehicle.vehicleNo,
        dateString: new Date(entry.date).toLocaleDateString(),
        fullTankText: entry.fullTank === 'yes' ? 'Yes' : 'No',
        status: entry.status || 'Pending',
        fuelType: entry.fuelType || 'N/A'
      }))
  );

  const getStatusChip = (status) => {
    let color;
    let label = status;

    switch (status.toLowerCase()) {
      case 'approved':
        color = 'success';
        label = 'Approved';
        break;
      case 'rejected':
        color = 'error';
        label = 'Rejected';
        break;
      default:
        color = 'warning';
        label = 'Pending';
    }

    return (
      <Chip
        label={label}
        color={color}
        variant="outlined"
        sx={{
          fontWeight: 'bold',
          minWidth: 100
        }}
      />
    );
  };

  const columns = [
    { field: 'vehicleNo', headerName: 'Vehicle No', flex: 1 },
    { field: 'pen', headerName: 'Entered By(PEN)', flex: 1 },
    { field: 'dateString', headerName: 'Date', flex: 1 },
    { field: 'presentKm', headerName: 'Present KM', flex: 1, type: 'number' },
    { field: 'previousKm', headerName: 'Previous KM', flex: 1, type: 'number' },
    { field: 'quantity', headerName: 'Qty (L)', flex: 1, type: 'number' },
    { field: 'amount', headerName: 'Amount (₹)', flex: 1, type: 'number' },
    { field: 'billNo', headerName: 'Bill No', flex: 1 },
    { field: 'fullTankText', headerName: 'Full Tank', flex: 1 },
    { field: 'fuelType', headerName: 'Fuel Type', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ pointerEvents: 'none' }}>{getStatusChip(params.value)}</Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 2.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="success"
            disabled={params.row.status === 'Approved'}
            onClick={() => handleStatusUpdate(params.row, 'Approved')}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            disabled={params.row.status === 'Rejected'}
            onClick={() => handleStatusUpdate(params.row, 'Rejected')}
          >
            Reject
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSelectedEntry(params.row);
              setOpenDialog(true);
            }}
          >
            View
          </Button>
        </Box>
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

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  // ✅ If "View All" is clicked, render FuelAdmin2 instead
  if (showAll) {
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">All Fuel Entries</Typography>
          <Button variant="outlined" onClick={() => setShowAll(false)}>
            Back to Pending
          </Button>
        </Box>
        <FuelAdmin2 darkMode={darkMode} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minWidth: 0, height: '100%', p: 2, overflow: 'hidden' }}>
      {/* Top heading and View All button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Pending Fuel Entry</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAll(true)} // ✅ Toggle to show all
        >
          View All
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0, height: '600px' }}>
        <DataGrid
          rows={allEntries}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          autoHeight={false}
          sx={{
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(224, 224, 224, 1)'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: darkMode ? '#424242' : '#f5f5f5'
            }
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Fuel Entry Details</DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Vehicle No:</strong> {selectedEntry.vehicleNo}</Typography>
                <Typography><strong>Entered By(PEN):</strong> {selectedEntry.pen}</Typography>
                <Typography><strong>Date:</strong> {selectedEntry.dateString}</Typography>
                <Typography><strong>Present KM:</strong> {selectedEntry.presentKm}</Typography>
                <Typography><strong>Previous KM:</strong> {selectedEntry.previousKm}</Typography>
                <Typography><strong>KMPL:</strong> {selectedEntry.kmpl}</Typography>
                <Typography><strong>Quantity (L):</strong> {selectedEntry.quantity}</Typography>
                <Typography><strong>Amount (₹):</strong> {selectedEntry.amount}</Typography>
                <Typography><strong>Bill No:</strong> {selectedEntry.billNo}</Typography>
                <Typography><strong>Full Tank:</strong> {selectedEntry.fullTankText}</Typography>
                <Typography><strong>Fuel Type:</strong> {selectedEntry.fuelType}</Typography>
                <Typography>
                  <strong>Status:</strong>
                  <Box component="span" sx={{ ml: 1 }}>
                    {getStatusChip(selectedEntry.status)}
                  </Box>
                </Typography>
                <Typography><strong>Firm Name:</strong> {selectedEntry.firmName}</Typography>
              </Box>

              {selectedEntry.file && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Bill Attachment</Typography>
                  {selectedEntry.fileType?.startsWith('image/') ? (
                    <img
                      src={`data:${selectedEntry.fileType};base64,${selectedEntry.file}`}
                      style={{ maxWidth: '100%', maxHeight: '400px' }}
                      alt="Fuel Bill"
                    />
                  ) : (
                    <iframe
                      src={`data:${selectedEntry.fileType};base64,${selectedEntry.file}`}
                      style={{ width: '100%', height: '500px', border: '1px solid #ddd' }}
                      title="Fuel Bill Document"
                    />
                  )}
                </Box>
              )}
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

export default FuelAdmin;
