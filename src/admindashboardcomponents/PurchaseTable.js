// components/PurchaseTable.js
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const PurchaseTable = ({ isAdmin = false }) => {
  const [purchases, setPurchases] = useState([]);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [billPreviewUrl, setBillPreviewUrl] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/purchases');
      setPurchases(res.data.reverse());
    } catch (err) {
      console.error('Failed to fetch purchases', err);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleViewBill = async (purchaseId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/purchases/${purchaseId}/bill`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setBillPreviewUrl(url);
      setBillDialogOpen(true);
    } catch (err) {
      console.error('Failed to load bill file:', err);
      alert('Failed to load bill file.');
    }
  };

  const handleEditClick = (purchase) => {
    setSelectedPurchase(purchase);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (purchase) => {
    setSelectedPurchase(purchase);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const data = new FormData();
      const p = selectedPurchase;
      data.append('itemName', p.itemName);
      data.append('quantity', p.quantity);
      data.append('price', p.price);
      data.append('Firm', p.Firm);
      data.append('date', p.date);
      data.append('billNo', p.billNo);
      if (p.billFile instanceof File) {
        data.append('billFile', p.billFile);
      }

      await axios.put(`http://localhost:5000/api/purchases/${p._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Updated successfully');
      setEditDialogOpen(false);
      fetchPurchases();
    } catch (err) {
      console.error('Error updating purchase:', err);
      alert('Update failed');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/purchases/${selectedPurchase._id}`);
      alert('Deleted successfully');
      setDeleteDialogOpen(false);
      fetchPurchases();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete purchase');
    }
  };

  const columns = [
    { field: 'itemName', headerName: 'Item Name', flex: 1 },
    { field: 'quantity', headerName: 'Qty', flex: 0.6 },
    { field: 'price', headerName: 'Price (₹)', flex: 0.8 },
    { field: 'Firm', headerName: 'Firm', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 0.8 },
    { field: 'billNo', headerName: 'Bill No', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 2,
      renderCell: (params) => (
        <>
          <Button size="small" variant="outlined" onClick={() => handleViewBill(params.row._id)}>View</Button>
          {isAdmin && (
            <>
              <Button size="small" variant="outlined" onClick={() => handleEditClick(params.row)} style={{ marginLeft: 8 }}>Edit</Button>
              <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteClick(params.row)} style={{ marginLeft: 8 }}>Delete</Button>
            </>
          )}
        </>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>{isAdmin ? 'All Purchases' : 'All Purchases'}</h2>
      <DataGrid
        rows={purchases.map(p => ({
          id: p._id,
          ...p,
          date: p.date ? new Date(p.date).toLocaleDateString('en-IN') : '--'
        }))}
        columns={columns}
        autoHeight
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Bill Preview Dialog */}
      <Dialog open={billDialogOpen} onClose={() => setBillDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Bill Preview</DialogTitle>
        <DialogContent dividers>
          {billPreviewUrl.endsWith('.pdf') ? (
            <iframe src={billPreviewUrl} width="100%" height="600px" title="Bill Preview" />
          ) : (
            <img src={billPreviewUrl} alt="Bill" style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth>
        <DialogTitle>Edit Purchase</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Item Name" value={selectedPurchase?.itemName || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, itemName: e.target.value })} />
          <TextField fullWidth margin="dense" label="Quantity" type="number" value={selectedPurchase?.quantity || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, quantity: e.target.value })} />
          <TextField fullWidth margin="dense" label="Price" type="number" value={selectedPurchase?.price || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, price: e.target.value })} />
          <TextField fullWidth margin="dense" label="Firm" value={selectedPurchase?.Firm || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, Firm: e.target.value })} />
          <TextField fullWidth margin="dense" type="date" label="Date" InputLabelProps={{ shrink: true }} value={selectedPurchase?.date?.substring(0, 10) || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, date: e.target.value })} />
          <TextField fullWidth margin="dense" label="Bill No" value={selectedPurchase?.billNo || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, billNo: e.target.value })} />
          <input type="file" accept="application/pdf,image/*" onChange={(e) => setSelectedPurchase({ ...selectedPurchase, billFile: e.target.files[0] })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this purchase?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PurchaseTable;
