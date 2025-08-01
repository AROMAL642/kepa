import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

function ViewRequests({ themeStyle }) {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/unverified-users');
      const formatted = res.data.map((user, index) => ({
        id: index,
        ...user
      }));
      setRequests(formatted);
    } catch (err) {
      console.error(err);
      setMessage('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (pen) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/verify-user/pen/${pen}`);
      setMessage('User verification successful');
      handleCloseDialog();
      fetchRequests();
    } catch (err) {
      console.error(err);
      setMessage('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (email) => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${email}`);
      const user = res.data;

      if (user.photo && typeof user.photo !== 'string') {
        user.photo = `data:image/jpeg;base64,${Buffer.from(user.photo.data).toString('base64')}`;
      }
      if (user.signature && typeof user.signature !== 'string') {
        user.signature = `data:image/png;base64,${Buffer.from(user.signature.data).toString('base64')}`;
      }

      setSelectedUser(user);
      setDialogOpen(true);
    } catch (err) {
      console.error(err);
      setMessage('Failed to fetch user details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'pen', headerName: 'PEN', width: 130 },
    { field: 'generalNo', headerName: 'General No', width: 150 },
    { field: 'email', headerName: 'Email', width: 220 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleView(params.row.email)}
            style={{ marginRight: 8 }}
          >
            View
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={() => handleVerify(params.row.pen)} // ✅ Use pen here
          >
            Verify
          </Button>
        </>
      )
    }
  ];

  return (
    <div className="view-requests-container">
      <Typography variant="h5" gutterBottom>Pending User Requests</Typography>
      {message && (
        <Typography variant="body1" style={{ marginBottom: '10px', color: '#00796B' }}>
          {message}
        </Typography>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <div style={{ height: 500, width: '100%', backgroundColor: themeStyle.background, color: themeStyle.color }}>
          <DataGrid
            rows={requests}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableRowSelectionOnClick
            sx={{
              backgroundColor: themeStyle.background,
              color: themeStyle.color,
              borderColor: themeStyle.color
            }}
          />
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>User Full Profile</DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <CircularProgress />
          ) : selectedUser ? (
            <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '10px' }}>
              <h3>User Details</h3>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>PEN:</strong> {selectedUser.pen}</p>
              <p><strong>General No:</strong> {selectedUser.generalNo}</p>
              <p><strong>DOB:</strong> {new Date(selectedUser.dob).toLocaleDateString()}</p>
              <p><strong>Gender:</strong> {selectedUser.gender}</p>
              <p><strong>Blood Group:</strong> {selectedUser.bloodGroup}</p>
              <p><strong>License No:</strong> {selectedUser.licenseNo}</p>

              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <div>
                  {selectedUser.photo ? (
                    <>
                      <img src={selectedUser.photo} alt="User" width="100" />
                      <p>Photo</p>
                    </>
                  ) : (
                    <p>No photo</p>
                  )}
                </div>
                <div>
                  {selectedUser.signature ? (
                    <>
                      <img src={selectedUser.signature} alt="Signature" width="100" />
                      <p>Signature</p>
                    </>
                  ) : (
                    <p>No signature</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ViewRequests;
