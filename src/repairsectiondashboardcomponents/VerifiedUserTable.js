import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const VerifiedUserTable = ({ themeStyle }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchVerifiedUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user-details/verified-user');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching verified users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedUser();
  }, []);

  const handleViewProfile = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-details/${userId}`);
      const userData = await response.json();
      setSelectedUser(userData);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'pen', headerName: 'PEN', flex: 1 },
    { field: 'generalNo', headerName: 'General No', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'role', headerName: 'Current Role', flex: 1 },
    {
      field: 'actions',
      headerName: 'Profile',
      sortable: false,
      filterable: false,
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => handleViewProfile(params.row._id)}
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            whiteSpace: 'nowrap',
          }}
        >
          View Profile
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ color: themeStyle?.color || '#000', marginBottom: '20px' }}>Verified Users</h2>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <DataGrid
          autoHeight
          rows={users}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          disableRowSelectionOnClick
          getRowId={(row) => row._id}
          sx={{
            width: '100%',
            maxWidth: '100%',
            color: themeStyle?.color || '#000',
            '& .MuiDataGrid-cell': {
              borderColor: themeStyle?.borderColor || '#ccc',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: themeStyle?.background === '#121212' ? '#333' : '#f5f5f5',
              color: themeStyle?.color || '#000',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: themeStyle?.background === '#121212' ? '#333' : '#f5f5f5',
              color: themeStyle?.color || '#000',
            },
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle style={{ background: themeStyle?.background, color: themeStyle?.color }}>
          User Details
        </DialogTitle>
        <DialogContent style={{ background: themeStyle?.background }}>
          {selectedUser && (
            <Box sx={{ display: 'flex', gap: 4, padding: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <img
                  src={selectedUser.photo || 'https://via.placeholder.com/150'}
                  alt="User"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
                <img
                  src={selectedUser.signature || 'https://via.placeholder.com/150'}
                  alt="Signature"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, color: themeStyle?.color }}>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>PEN:</strong> {selectedUser.pen}</p>
                <p><strong>General No:</strong> {selectedUser.generalNo}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Date of Birth:</strong> {selectedUser.dob}</p>
                <p><strong>License No:</strong> {selectedUser.licenseNo}</p>
                <p><strong>Blood Group:</strong> {selectedUser.bloodGroup}</p>
                <p><strong>Gender:</strong> {selectedUser.gender}</p>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ background: themeStyle?.background }}>
          <Button onClick={() => setOpenDialog(false)} style={{ color: themeStyle?.color }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifiedUserTable;
