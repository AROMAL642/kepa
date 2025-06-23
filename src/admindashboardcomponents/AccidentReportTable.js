import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const AccidentReportTable = ({ themeStyle }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewAll, setViewAll] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/accidents');
      const data = await res.json();

      const filtered = viewAll ? data : data.filter(item => item.status === 'pending');

      const formatted = filtered.map((item) => ({
        id: item._id,
        _id: item._id,
        vehicleNo: item.vehicleNo,
        pen: item.pen,
        penDisplay: item.penDisplay || item.pen,
        accidentTime: item.accidentTime,
        location: item.location,
        description: item.description,
        status: item.status,
        date: item.date,
        image: item.image?.data
          ? `data:${item.image.contentType};base64,${item.image.data}`
          : ''
      }));

      setRows(formatted);
    } catch (err) {
      console.error('Error fetching accident data:', err);
    } finally {
      setLoading(false);
    }
  }, [viewAll]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewDetails = (row) => {
    setSelectedReport(row);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedReport(null);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/accidents/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        await fetchReports();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  const formatDate = (value) => {
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (value) => {
    return value && /^\d{2}:\d{2}$/.test(value) ? value : 'Invalid Time';
  };

  const columns = [
    { field: 'vehicleNo', headerName: 'Vehicle No', minWidth: 120, flex: 1 },
    { field: 'penDisplay', headerName: 'Entered By', minWidth: 150, flex: 1 },
    {
      field: 'date',
      headerName: 'Date',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => {
        const val = params.row?.date;
        return val ? new Date(val).toLocaleDateString() : 'N/A';
      }
    },
    {
      field: 'accidentTime',
      headerName: 'Time',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => formatTime(params.row?.accidentTime)
    },
    { field: 'location', headerName: 'Location', minWidth: 150, flex: 1 },
    { field: 'description', headerName: 'Description', minWidth: 180, flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => {
        const colorMap = {
          verified: 'green',
          rejected: 'red',
          pending: 'gray'
        };
        return (
          <strong style={{ color: colorMap[params.value] || 'gray' }}>
            {params.value?.toUpperCase()}
          </strong>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 250,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => handleViewDetails(params.row)}>
            View
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => updateStatus(params.row._id, 'verified')}
            disabled={params.row.status === 'verified'}
          >
            Verify
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => updateStatus(params.row._id, 'rejected')}
            disabled={params.row.status === 'rejected'}
          >
            Reject
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%', ...themeStyle, paddingBottom: '2rem' }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        <Typography variant="h6" component="div">
          Accident Report Table ({viewAll ? 'All' : 'Pending Only'})
        </Typography>
        <Button
          variant="contained"
          onClick={() => setViewAll(!viewAll)}
          sx={{ mt: { xs: 1, sm: 0 } }}
        >
          {viewAll ? 'View Pending Only' : 'View All Accident Reports'}
        </Button>
      </Box>

      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={5}
          rowsPerPageOptions={[5, 10]}
          autoHeight
          sx={{
            backgroundColor: themeStyle.background,
            color: themeStyle.color,
            minWidth: '600px'
          }}
        />
      </Box>

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Accident Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedReport.vehicleNo}</Typography>
              <Typography><strong>Entered By:</strong> {selectedReport.penDisplay}</Typography>
              <Typography><strong>Date:</strong> {formatDate(selectedReport.date)}</Typography>
              <Typography><strong>Time:</strong> {formatTime(selectedReport.accidentTime)}</Typography>
              <Typography><strong>Location:</strong> {selectedReport.location}</Typography>
              <Typography><strong>Description:</strong> {selectedReport.description}</Typography>
              <Typography><strong>Status:</strong> {selectedReport.status}</Typography>
              <br />
              {selectedReport.image ? (
                <img
                  src={selectedReport.image}
                  alt="Accident"
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    border: '1px solid #ccc'
                  }}
                />
              ) : (
                <Typography color="textSecondary">No Image Available</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccidentReportTable;
