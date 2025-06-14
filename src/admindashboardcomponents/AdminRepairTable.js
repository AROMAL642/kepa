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

const RepairAdminTable = ({ themeStyle }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);

  const fetchRepairs = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/repair-request');
      const data = await res.json();

      const formatted = data.map((item , index) => ({
        slNo: index + 1,
        id: item._id,
        _id: item._id,
        pen: item.pen,
        vehicleNo: item.vehicleNo,
        //userName: item.user?.name || 'Unknown',
        subject: item.subject,
        description: item.description,
        date: item.date,
        status: item.status || 'pending',
        billFile: item.billFile?.data
          ? `data:${item.billFile.contentType};base64,${item.billFile.data}`
          : ''
      }));

      setRows(formatted);
    } catch (err) {
      console.error('Error fetching repair requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  const handleViewDetails = (row) => {
    setSelectedRepair(row);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedRepair(null);
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-request/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        await fetchRepairs();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Network error:', err);
    }
  };

  const columns = [
    { field: 'slNo', headerName: 'Sl. No', width: 90 },

    { field: 'vehicleNo', headerName: 'Vehicle No', width: 130 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    //{ field: 'userName', headerName: 'User Name', width: 150 },
    { field: 'subject', headerName: 'Subject', width: 180 , disableColumnMenu: true , sortable: false },
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
        return <strong style={{ color: colorMap[params.value] || 'gray' }}>{params.value.toUpperCase()}</strong>;
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 270,
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
      <h2>Repair Requests</h2>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={5}
        rowsPerPageOptions={[5, 10]}
        style={{ background: themeStyle.background, color: themeStyle.color }}
      />

      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Repair Request Details</DialogTitle>
        <DialogContent>
          {selectedRepair && (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedRepair.vehicleNo}</Typography>
              <Typography><strong>PEN:</strong> {selectedRepair.pen}</Typography>
              <Typography><strong>Date:</strong> {selectedRepair.date}</Typography>
              <Typography><strong>Subject:</strong> {selectedRepair.subject}</Typography>
              <Typography><strong>Description:</strong> {selectedRepair.description}</Typography>
              <Typography><strong>Status:</strong> {selectedRepair.status}</Typography>
              <br />
              {selectedRepair.billFile ? (
                <iframe
                  src={selectedRepair.billFile}
                  title="Bill File"
                  style={{ width: '100%', height: '400px', border: 'none' }}
                />
              ) : (
                <Typography color="textSecondary">No Bill File Available</Typography>
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

export default RepairAdminTable;
