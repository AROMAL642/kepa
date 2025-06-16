import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

const AccidentReportTable = ({ themeStyle }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/accidents');
      const data = await res.json();

      const formatted = data.map((item) => ({
        id: item._id,
        _id: item._id,
        vehicleNo: item.vehicleNo,
        pen: item.pen,
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
  }, []);

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

  // Helper functions
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
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 150 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    {
  field: 'date',
  headerName: 'Date',
  width: 150,
  renderCell: (params) => {
    const val = params.row?.date;
    if (!val) return 'N/A';
    const date = new Date(val);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  }
},
{
  field: 'accidentTime',
  headerName: 'Time',
  width: 120,
  renderCell: (params) => {
    const val = params.row?.accidentTime;
    return val && /^\d{2}:\d{2}$/.test(val) ? val : 'Invalid Time';
  }
}
,
    { field: 'location', headerName: 'Location', width: 180 },
    { field: 'description', headerName: 'Description', width: 220 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
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
      width: 260,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleViewDetails(params.row)}
            style={{ marginRight: 8 }}
          >
            View
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => updateStatus(params.row._id, 'verified')}
            disabled={params.row.status === 'verified'}
            style={{ marginRight: 4 }}
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
        </>
      )
    }
  ];

  return (
    <div style={{ height: 600, width: '100%', ...themeStyle }}>
      <h2>Accident Report Table</h2>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        style={{ background: themeStyle.background, color: themeStyle.color }}
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Accident Report Details</DialogTitle>
        <DialogContent>
          {selectedReport && (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedReport.vehicleNo}</Typography>
              <Typography><strong>PEN:</strong> {selectedReport.pen}</Typography>
              <Typography>
                <strong>Date:</strong> {formatDate(selectedReport.date)}
              </Typography>
              <Typography>
                <strong>Time:</strong> {formatTime(selectedReport.accidentTime)}
              </Typography>
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
    </div>
  );
};

export default AccidentReportTable;
