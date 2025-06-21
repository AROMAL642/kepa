import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';

const RepairAdminTable = ({ themeStyle }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  const fetchRepairs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/repair-request');
      const data = await res.json();

      const formatted = data.map((item, index) => ({
        slNo: index + 1,
        id: item._id,
        _id: item._id,
        pen: item.pen,
        vehicleNo: item.vehicleNo,
        subject: item.subject,
        description: item.description,
        date: item.date,
        status: item.status || 'pending',
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

  // 👇 Load full repair details with billFile when needed
  const handleViewDetails = async (row) => {
    setDialogLoading(true);
    setDialogOpen(true);

    try {
      const res = await fetch(`http://localhost:5000/api/repair-request/${row._id}`);
      const data = await res.json();

      const billFile =
        data.billFile?.data && data.billFile?.contentType
          ? `data:${data.billFile.contentType};base64,${data.billFile.data}`
          : '';

      setSelectedRepair({ ...data, billFile });
    } catch (err) {
      console.error('Error fetching full repair details:', err);
      alert('Failed to load full repair details');
    } finally {
      setDialogLoading(false);
    }
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

  const forwardToMechanic = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repair-request/${id}/forward-to-mechanic`, {
        method: 'PUT',
      });

      if (res.ok) {
        alert('Request forwarded to mechanic');
        await fetchRepairs();
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to forward request');
      }
    } catch (err) {
      console.error('Error forwarding:', err);
      alert('Network error while forwarding');
    }
  };

  const columns = [
    { field: 'slNo', headerName: 'Sl. No', width: 90 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 130 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    { field: 'subject', headerName: 'Subject', width: 180 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => {
        const colorMap = {
          verified: 'green',
          rejected: 'red',
          pending: 'gray',
          forwarded: 'blue',
          sent_to_repair_admin: 'orange'
        };
        return (
          <strong style={{ color: colorMap[params.value] || 'gray' }}>
            {params.value.toUpperCase().replace(/_/g, ' ')}
          </strong>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      renderCell: (params) => {
        const isVerifiedOrBeyond = ['verified', 'forwarded', 'sent_to_repair_admin', 'user_approved'].includes(params.row.status);

        return (
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
              onClick={async () => {
                await updateStatus(params.row._id, 'verified');
                await forwardToMechanic(params.row._id);
              }}
              disabled={isVerifiedOrBeyond}
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
        );
      }
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

      {/* Repair Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Repair Request Details</DialogTitle>
        <DialogContent>
          {dialogLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <CircularProgress />
            </div>
          ) : selectedRepair ? (
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
          ) : (
            <Typography>No details available.</Typography>
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
