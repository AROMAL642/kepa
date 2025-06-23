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
  Typography
} from '@mui/material';

const MechanicRepairList = ({ darkMode }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/mechanic/pending');
      const data = res.data.map((item, i) => ({
        ...item,
        id: item._id,
        slNo: i + 1
      }));
      setRows(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
 



  useEffect(() => {
    fetchTasks();
  }, []);

  const markDone = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/mechanic/verify/${id}`);
      alert('Sent to user for verification');
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed');
    }
  };

  const markNotDone = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/mechanic/notify-mti/${id}`);
      alert('Sent back to MTI for re-check');
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Failed');
    }
  };

  const openBillFile = (billFile) => {
    if (!billFile || !billFile.data) {
      alert("No bill uploaded");
      return;
    }

    const byteArray = new Uint8Array(billFile.data.data);
    const blob = new Blob([byteArray], { type: billFile.contentType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const columns = [
    { field: 'slNo', headerName: 'Sl No', width: 80 },
    { field: 'pen', headerName: 'PEN', width: 100 },
    { field: 'vehicleNo', headerName: 'Vehicle No', width: 140 },
    {
      field: 'billFile',
      headerName: 'Bill',
      width: 100,
      renderCell: params => (
        params.row.billFile
          ? <Button onClick={() => openBillFile(params.row.billFile)}>View</Button>
          : <Typography variant="body2" color="textSecondary">N/A</Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Work Done?',
      width: 250,
      renderCell: params => (
        <Box>
          <Button
            variant="contained"
            color="success"
            onClick={() => markDone(params.row._id)}
            style={{ marginRight: 8 }}
          >
            Yes
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => markNotDone(params.row._id)}
          >
            No
          </Button>
        </Box>
      )
    },
    {
      field: 'view',
      headerName: 'Details',
      width: 100,
      renderCell: params => (
        <Button
          variant="outlined"
          onClick={() => {
            setSelectedRow(params.row);
            setOpenDialog(true);
          }}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4">Mechanic Repair Tasks</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 400, mt: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: darkMode ? '#333' : '#f0f0f0'
              }
            }}
          />
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <Box sx={{ p: 1 }}>
              <Typography><strong>PEN:</strong> {selectedRow.pen}</Typography>
              <Typography><strong>Vehicle No:</strong> {selectedRow.vehicleNo}</Typography>
              <Typography><strong>Date:</strong> {selectedRow.date}</Typography>
              <Typography><strong>Subject:</strong> {selectedRow.subject}</Typography>
              <Typography><strong>Description:</strong> {selectedRow.description}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MechanicRepairList;
