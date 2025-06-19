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

  // New mechanic request-related states
  const [mechanicRequests, setMechanicRequests] = useState([]);
  const [showMechanicTab, setShowMechanicTab] = useState(false);
  const [mechanicDialogOpen, setMechanicDialogOpen] = useState(false);
  const [selectedMechanicRequest, setSelectedMechanicRequest] = useState(null);

  // Fetch repair requests
  const fetchRepairs = useCallback(async () => {
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

  // Fetch mechanic requests
  useEffect(() => {
    fetch('http://localhost:5000/api/repair-request/forwarded')

      .then(res => res.json())
      .then(data => setMechanicRequests(data))
      .catch(err => console.error('Failed to load mechanic requests:', err));
  }, []);

  const handleViewDetails = (row) => {
    setSelectedRepair(row);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedRepair(null);
  };

  const handleViewMechanicRequest = (row) => {
    setSelectedMechanicRequest(row);
    setMechanicDialogOpen(true);
  };

  const handleCloseMechanicDialog = () => {
    setMechanicDialogOpen(false);
    setSelectedMechanicRequest(null);
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
        method: 'PUT'
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
      width: 160,
      renderCell: (params) => {
        const colorMap = {
          verified: 'green',
          rejected: 'red',
          pending: 'gray',
          forwarded: 'blue',
          'sent_to_repair_admin': 'orange'
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
        const status = params.row.status;
        const isVerified = status === 'verified';
        const isForwarded = status === 'forwarded';
        const isRejected = status === 'rejected';

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
              disabled={isVerified || isForwarded}
              style={{ marginRight: 4 }}
            >
              Verify
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => updateStatus(params.row._id, 'rejected')}
              disabled={isRejected}
            >
              Reject
            </Button>
          </>
        );
      }
    }
  ];

  return (
    <div style={{ width: '100%', ...themeStyle }}>
      <h2>{showMechanicTab ? 'Mechanic Requests' : 'Repair Requests'}</h2>

      <div style={{ marginBottom: 10 }}>
        <Button
          variant={!showMechanicTab ? 'contained' : 'outlined'}
          onClick={() => setShowMechanicTab(false)}
          style={{ marginRight: 10 }}
        >
          Repair Requests
        </Button>
        <Button
          variant={showMechanicTab ? 'contained' : 'outlined'}
          onClick={() => setShowMechanicTab(true)}
        >
          Mechanic Requests
        </Button>
      </div>

      {!showMechanicTab ? (
  <div style={{ height: 600 }}>
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      pageSize={5}
      rowsPerPageOptions={[5, 10]}
      style={{ background: themeStyle.background, color: themeStyle.color }}
    />
  </div>
) : (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Sl No</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Vehicle No</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>PEN</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Date</th>
        <th style={{ padding: 10, borderBottom: '1px solid #ccc' }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {mechanicRequests
        .filter(req => req.status === 'sent_to_repair_admin')
        .map((req, index) => (
          <tr key={req._id}>
            <td style={{ padding: 10 }}>{index + 1}</td>
            <td style={{ padding: 10 }}>{req.vehicleNo}</td>
            <td style={{ padding: 10 }}>{req.pen}</td>
            <td style={{ padding: 10 }}>{req.date}</td>
            <td style={{ padding: 10 }}>
              <Button variant="outlined" onClick={() => handleViewMechanicRequest(req)}>View</Button>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
)}


      {/* Repair Request Dialog */}
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

      {/* Mechanic Request Dialog */}
      <Dialog open={mechanicDialogOpen} onClose={handleCloseMechanicDialog} fullWidth maxWidth="md">
        <DialogTitle>Mechanic Request Details</DialogTitle>
        <DialogContent>
          {selectedMechanicRequest && selectedMechanicRequest.partsList?.length > 0 ? (
            <>
              <Typography><strong>Vehicle No:</strong> {selectedMechanicRequest.vehicleNo}</Typography>
              <Typography><strong>Work Done:</strong> {selectedMechanicRequest.workDone}</Typography>

              <Typography variant="h6" style={{ marginTop: '16px' }}>Parts Required</Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Sl No</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Part Name</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '6px' }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMechanicRequest.partsList.map((part, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '6px' }}>{part.slNo}</td>
                      <td style={{ padding: '6px' }}>{part.partName}</td>
                      <td style={{ padding: '6px' }}>{part.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedMechanicRequest.billFile ? (
                <>
                  <Typography variant="h6" style={{ marginTop: '16px' }}>Uploaded Bill</Typography>
                  <iframe
                    src={selectedMechanicRequest.billFile}
                    title="Bill"
                    style={{ width: '100%', height: '400px', border: 'none' }}
                  />
                </>
              ) : (
                <Typography color="textSecondary">No Bill Uploaded</Typography>
              )}
            </>
          ) : (
            <Typography>No mechanic request details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMechanicDialog}>Close</Button>
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              const res = await fetch(`http://localhost:5000/api/repair-request/${selectedMechanicRequest._id}/forward-to-repair`, {
                method: 'PUT',
              });
              if (res.ok) {
                alert('Request forwarded to Repair Section');
                fetchRepairs();
                handleCloseMechanicDialog();
              } else {
                alert('Failed to forward request');
              }
            }}
          >
            Forward to Repair Section
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RepairAdminTable;
