import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  CircularProgress,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  Typography
} from '@mui/material';

const VerifiedUsersTable = ({ themeStyle }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [roleAssignments, setRoleAssignments] = useState({});
  const [updatingRole, setUpdatingRole] = useState(null);
  const [eyeTestLoading, setEyeTestLoading] = useState(false);

  useEffect(() => {
    const fetchVerifiedUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user-details/verified-users');
        const data = await response.json();
        setUsers(data);

        const initialRoles = {};
        data.forEach(user => {
          initialRoles[user._id] = user.role || 'user';
        });
        setRoleAssignments(initialRoles);
      } catch (error) {
        console.error('Error fetching verified users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedUsers();
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

  const handleRoleChange = (userId, newRole) => {
    setRoleAssignments(prev => ({
      ...prev,
      [userId]: newRole
    }));
  };

  const handleAssignRole = async (userId) => {
    setUpdatingRole(userId);
    try {
      const response = await fetch(`http://localhost:5000/api/user-details/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: roleAssignments[userId]
        })
      });

      if (!response.ok) throw new Error('Failed to update role');

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: roleAssignments[userId] } : user
        )
      );
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleRemoveUser = async () => {
    if (!selectedUser || !selectedUser.pen) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete user with PEN ${selectedUser.pen}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/user-delete/pen/${selectedUser.pen}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Delete failed:', data.message);
        alert(`Failed to delete user: ${data.message}`);
        return;
      }

      setUsers(prevUsers => prevUsers.filter(user => user.pen !== selectedUser.pen));
      setOpenDialog(false);
      setSelectedUser(null);
      alert('User successfully removed');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user due to a network or server error');
    }
  };

  const handleViewEyeTestReport = async () => {
    if (!selectedUser || !selectedUser.pen) return;

    setEyeTestLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/eye-test/view/${selectedUser.pen}`);

      if (!response.ok) {
        alert('No Eye Test Report found for this user.');
        setEyeTestLoading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error fetching Eye Test Report:', error);
      alert('Failed to fetch Eye Test Report');
    } finally {
      setEyeTestLoading(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'pen', headerName: 'PEN', flex: 1 },
    { field: 'generalNo', headerName: 'General No', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
    { field: 'role', headerName: 'Current Role', flex: 1 },
    {
      field: 'roleAssign',
      headerName: 'Assign Role',
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={roleAssignments[params.row._id] || 'user'}
              onChange={(e) => handleRoleChange(params.row._id, e.target.value)}
              sx={{
                backgroundColor: themeStyle.background === '#121212' ? '#333' : '#fff',
                color: themeStyle.color,
                height: '36px',
              }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="mti">MTI</MenuItem>
              <MenuItem value="fuel">Fuel</MenuItem>
              <MenuItem value="repair">Repair</MenuItem>
              <MenuItem value="mechanic">Mechanic</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleAssignRole(params.row._id)}
            disabled={updatingRole === params.row._id}
            sx={{ backgroundColor: '#1976d2', color: '#fff', whiteSpace: 'nowrap' }}
          >
            <Typography variant="button">
              {updatingRole === params.row._id ? 'Updating...' : 'Assign'}
            </Typography>
          </Button>
        </Box>
      ),
    },
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
          sx={{ backgroundColor: '#1976d2', color: '#fff', whiteSpace: 'nowrap' }}
        >
          <Typography variant="button">View Profile</Typography>
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
    <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', p: 2, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: themeStyle.color, marginBottom: '20px' }}>Verified Users</h2>

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
            color: themeStyle.color,
            '& .MuiDataGrid-cell': { borderColor: themeStyle.borderColor },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: themeStyle.background === '#121212' ? '#333' : '#f5f5f5',
              color: themeStyle.color,
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: themeStyle.background === '#121212' ? '#333' : '#f5f5f5',
              color: themeStyle.color,
            },
          }}
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle style={{ background: themeStyle.background, color: themeStyle.color }}>
          User Details
        </DialogTitle>
        <DialogContent style={{ background: themeStyle.background }}>
          {selectedUser && (
            <Box sx={{ display: 'flex', gap: 4, padding: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <img
                  src={selectedUser.photo || 'https://via.placeholder.com/150'}
                  alt="User"
                  style={{ width: '150px', height: '150px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <img
                  src={selectedUser.signature || 'https://via.placeholder.com/150'}
                  alt="Signature"
                  style={{ width: '150px', height: '150px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </Box>
              <Box sx={{ flex: 1, color: themeStyle.color }}>
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>PEN:</strong> {selectedUser.pen}</p>
                <p><strong>General No:</strong> {selectedUser.generalNo}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Date of Birth:</strong> {selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : 'N/A'}</p>
                <p><strong>License No:</strong> {selectedUser.licenseNo || 'N/A'}</p>
                <p><strong>Blood Group:</strong> {selectedUser.bloodGroup || 'N/A'}</p>
                <p><strong>Gender:</strong> {selectedUser.gender || 'N/A'}</p>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          style={{
            background: themeStyle.background,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={handleViewEyeTestReport} variant="outlined" disabled={eyeTestLoading}>
              <Typography variant="button">
                {eyeTestLoading ? 'Loading...' : 'View Eye Test Report'}
              </Typography>
            </Button>
            <Button onClick={handleRemoveUser} variant="contained" color="error">
              <Typography variant="button">Remove User</Typography>
            </Button>
          </Box>
          <Button onClick={() => setOpenDialog(false)} style={{ color: themeStyle.color }}>
            <Typography variant="button">Close</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerifiedUsersTable;
