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

const StatusChip = ({ status }) => {
  let color = 'default';
  const normalized = status?.toString().trim().toLowerCase();

  if (normalized === 'approved') color = 'success';
  else if (normalized === 'rejected') color = 'error';
  else if (normalized === 'pending') color = 'warning';

  return (
    <Chip
      label={status}
      color={color}
      variant="outlined"
      size="small"
      sx={{
        fontWeight: 'bold',
        pointerEvents: 'none',
        textTransform: 'capitalize'
      }}
    />
  );
};

const FuelAdmin = ({ darkMode }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
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
    fetchFuelData();
  }, []);

  const allEntries = vehicles.flatMap(vehicle =>
    vehicle.fuelEntries.map(entry => ({
      ...entry,
      id: entry._id,
      vehicleNo: vehicle.vehicleNo,
      dateString: new Date(entry.date).toLocaleDateString(),
      fullTankText: entry.fullTank === 'yes' ? 'Yes' : 'No',
      status: entry.status || 'Pending'
    }))
  );

  const columns = [
    { field: 'vehicleNo', headerName: 'Vehicle No', flex: 1 },
    { field: 'pen', headerName: 'PEN', flex: 1 },
    { field: 'dateString', headerName: 'Date', flex: 1 },
    { field: 'presentKm', headerName: 'Present KM', flex: 1, type: 'number' },
    { field: 'previousKm', headerName: 'Previous KM', flex: 1, type: 'number' },
    { field: 'kmpl', headerName: 'KMPL', flex: 1, type: 'number' },
    { field: 'quantity', headerName: 'Qty (L)', flex: 1, type: 'number' },
    { field: 'amount', headerName: 'Amount (₹)', flex: 1, type: 'number' },
    { field: 'billNo', headerName: 'Bill No', flex: 1 },
    { field: 'fullTankText', headerName: 'Full Tank', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    {
      field: 'actions',
      headerName: 'Details',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            setSelectedEntry(params.row);
            setOpenDialog(true);
          }}
        >
          View Details
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

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minWidth: 0, height: '100%', p: 2, overflow: 'hidden' }}>
      <Typography variant="h4" gutterBottom>
        Fuel Entry Review
      </Typography>

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

      {/* Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Fuel Entry Details</DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Vehicle No:</strong> {selectedEntry.vehicleNo}</Typography>
                <Typography><strong>PEN:</strong> {selectedEntry.pen}</Typography>
                <Typography><strong>Date:</strong> {selectedEntry.dateString}</Typography>
                <Typography><strong>Present KM:</strong> {selectedEntry.presentKm}</Typography>
                <Typography><strong>Previous KM:</strong> {selectedEntry.previousKm}</Typography>
                <Typography><strong>KMPL:</strong> {selectedEntry.kmpl}</Typography>
                <Typography><strong>Quantity (L):</strong> {selectedEntry.quantity}</Typography>
                <Typography><strong>Amount (₹):</strong> {selectedEntry.amount}</Typography>
                <Typography><strong>Bill No:</strong> {selectedEntry.billNo}</Typography>
                <Typography><strong>Full Tank:</strong> {selectedEntry.fullTankText}</Typography>
                <Typography><strong>Status:</strong> <StatusChip status={selectedEntry.status} /></Typography>
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
