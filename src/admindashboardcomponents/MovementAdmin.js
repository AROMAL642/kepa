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

const MovementAdmin = ({ darkMode }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchMovementData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movements/all');

        const transformedData = response.data.map((movement, index) => ({
          ...movement,
          id: movement._id || index,
          vehicleNo: movement.vehicleno,
          startDateString: movement.startingdate
            ? new Date(movement.startingdate).toLocaleDateString()
            : 'N/A',
          endDateString: movement.endingdate
            ? new Date(movement.endingdate).toLocaleDateString()
            : 'N/A',
          distance:
            movement.endingkm != null && movement.startingkm != null
              ? movement.endingkm - movement.startingkm
              : 'N/A',
          displayStatus: movement.status === 'Active' ? 'In Trip' : 'Complete'
        }));

        setMovements(transformedData);
      } catch (error) {
        console.error('Error fetching movement data:', error);
        setError('Failed to load movement data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMovementData();
  }, []);

  const columns = [
    { field: 'vehicleNo', headerName: 'Vehicle No', flex: 1 },
    { field: 'pen', headerName: 'PEN', flex: 1 },
    { field: 'startDateString', headerName: 'Start Date', flex: 1 },
    { field: 'endDateString', headerName: 'End Date', flex: 1 },
    { field: 'destination', headerName: 'Destination', flex: 1 },
    { field: 'purpose', headerName: 'Purpose', flex: 1 },
    {
      field: 'displayStatus',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'In Trip' ? 'primary' : 'success'}
          variant="outlined"
          sx={{ pointerEvents: 'none' }}
        />
      )
    },
    {
      field: 'distance',
      headerName: 'Distance (km)',
      flex: 1
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
        Movement Register
      </Typography>

      <Box sx={{ flexGrow: 1, minWidth: 0, height: '600px' }}>
        <DataGrid
          rows={movements}
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
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Movement Details</DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography>
                  <strong>Vehicle No:</strong> {selectedEntry.vehicleNo}
                </Typography>
                <Typography>
                  <strong>PEN:</strong> {selectedEntry.pen}
                </Typography>
                <Typography>
                  <strong>Start Date:</strong> {selectedEntry.startDateString}
                </Typography>
                <Typography>
                  <strong>Start Time:</strong> {selectedEntry.startingtime}
                </Typography>
                <Typography>
                  <strong>Start KM:</strong> {selectedEntry.startingkm}
                </Typography>
                <Typography>
                  <strong>Destination:</strong> {selectedEntry.destination}
                </Typography>
                <Typography>
                  <strong>Purpose:</strong> {selectedEntry.purpose}
                </Typography>
                <Typography>
                  <strong>Status:</strong>
                  <Chip
                    label={selectedEntry.displayStatus}
                    color={selectedEntry.displayStatus === 'In Trip' ? 'primary' : 'success'}
                    variant="outlined"
                    sx={{ ml: 1, pointerEvents: 'none' }}
                  />
                </Typography>

                {selectedEntry.displayStatus === 'Complete' && (
                  <>
                    <Typography>
                      <strong>End Date:</strong> {selectedEntry.endDateString}
                    </Typography>
                    <Typography>
                      <strong>End Time:</strong> {selectedEntry.endingtime}
                    </Typography>
                    <Typography>
                      <strong>End KM:</strong> {selectedEntry.endingkm}
                    </Typography>
                    <Typography>
                      <strong>Officer In Charge:</strong> {selectedEntry.officerincharge}
                    </Typography>
                    <Typography>
                      <strong>Distance Traveled:</strong> {selectedEntry.distance} km
                    </Typography>
                  </>
                )}
              </Box>
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

export default MovementAdmin;
