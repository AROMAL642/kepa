import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem
} from '@mui/material';

const ViewAllStocks = ({ onBack }) => {
  const [rows, setRows] = useState([]);
  const [editData, setEditData] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stockroutes');
      const formatted = res.data.map((item, index) => ({
        ...item,
        id: item._id, // For DataGrid
        sl: index + 1,
      }));
      setRows(formatted);
    } catch (err) {
      console.error('❌ Error fetching stocks:', err.message);
    }
  };

  const handleDelete = async (_id) => {
    if (window.confirm('Delete this stock item?')) {
      try {
        await axios.delete(`http://localhost:5000/api/stockroutes/${_id}`);
        alert('Deleted successfully');
        fetchStocks();
      } catch (err) {
        console.error('❌ Delete error:', err.message);
        alert('Delete failed');
      }
    }
  };

  const handleEditClick = (item) => {
  setEditData({ ...item, _id: item._id || item.id });
  setOpen(true);
};


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: name === 'hasWarranty' ? value : value,
    }));
  };

  const handleEditSave = async () => {
  const id = editData._id;

  if (!id) {
    console.error("❌ Cannot update stock: Missing ID", editData);
    alert("Stock ID missing. Cannot update.");
    return;
  }

  try {
    // Convert hasWarranty to boolean
    const dataToSend = {
      ...editData,
      hasWarranty: editData.hasWarranty === 'true'
    };

    const url = `http://localhost:5000/api/stockroutes/${id}`;
    console.log("🔁 Sending PUT to:", url, "with data:", dataToSend);

    await axios.put(url, dataToSend);
    alert('✅ Stock updated successfully');
    setOpen(false);
    fetchStocks();
  } catch (err) {
    console.error('❌ Save error:', err.message);
    alert('Update failed: ' + err.message);
  }
};

  const columns = [
    { field: 'sl', headerName: 'SL', width: 70 },
    { field: 'enteredBy', headerName: 'Entered By', width: 200 },
    { field: 'itemType', headerName: 'Type', width: 130 },
    { field: 'itemName', headerName: 'Name', width: 150 },
    { field: 'serialNo', headerName: 'Serial No', width: 150 },
    { field: 'quantity', headerName: 'Qty', width: 80 },
    { field: 'condition', headerName: 'Condition', width: 100 },
    { field: 'status', headerName: 'Status', width: 100 },
    {
      field: 'hasWarranty',
      headerName: 'Warranty',
      width: 100,
      renderCell: (params) => (params.value ? 'Yes' : 'No')
    },
    { field: 'warrantyNumber', headerName: 'Warranty No', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outlined" size="small" onClick={() => handleEditClick(params.row)}>EDIT</Button>
          <Button variant="outlined" size="small" color="error" onClick={() => handleDelete(params.row._id)}>DELETE</Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack} style={{
        marginBottom: 15,
        padding: '8px 16px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        ⬅️ Back
      </button>

      <h2 style={{ marginBottom: 20 }}>All Stock Entries</h2>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid rows={rows} columns={columns} pageSize={7} />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Stock</DialogTitle>
        <DialogContent>
          <TextField label="Item Type" name="itemType" value={editData.itemType || ''} onChange={handleEditChange} fullWidth margin="dense" />
          <TextField label="Item Name" name="itemName" value={editData.itemName || ''} onChange={handleEditChange} fullWidth margin="dense" />
          <TextField label="Quantity" name="quantity" type="number" value={editData.quantity || ''} onChange={handleEditChange} fullWidth margin="dense" />
          <TextField select label="Condition" name="condition" value={editData.condition || ''} onChange={handleEditChange} fullWidth margin="dense">
            <MenuItem value="New">New</MenuItem>
            <MenuItem value="Used">Used</MenuItem>
            <MenuItem value="Damaged">Damaged</MenuItem>
          </TextField>
          <TextField select label="Status" name="status" value={editData.status || ''} onChange={handleEditChange} fullWidth margin="dense">
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="In Use">In Use</MenuItem>
            <MenuItem value="Damaged">Damaged</MenuItem>
          </TextField>
          <TextField select label="Warranty" name="hasWarranty" value={editData.hasWarranty || 'false'} onChange={handleEditChange} fullWidth margin="dense">
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
          {editData.hasWarranty === 'true' && (
            <TextField label="Warranty Number" name="warrantyNumber" value={editData.warrantyNumber || ''} onChange={handleEditChange} fullWidth margin="dense" />
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewAllStocks;
