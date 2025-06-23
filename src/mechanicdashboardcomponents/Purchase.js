import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/stocks.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const Purchase = () => {
  const [purchases, setPurchases] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [billPreviewUrl, setBillPreviewUrl] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [formData, setFormData] = useState({
    pen: '',
    itemName: '',
    quantity: '',
    price: '',
    Firm: '',
    date: '',
    billNo: '',
    billFile: null,
    warrantyNumber: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('adminData');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData((prev) => ({ ...prev, pen: user.pen }));
    }
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/purchases');
      const cleaned = res.data.map(p => {
        delete p.createdAt;
        delete p.updatedAt;
        delete p.__v;
        return p;
      });
      setPurchases(cleaned.reverse());
    } catch (err) {
      console.error('Failed to fetch purchases', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'billFile') {
      setFormData(prev => ({ ...prev, billFile: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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
    setSelectedPurchase({
      ...purchase,
      date: purchase.date?.substring(0, 10),
      billFile: null
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (purchase) => {
    setSelectedPurchase(purchase);
    setDeleteDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const data = new FormData();
      data.append('pen', selectedPurchase.pen);
      data.append('itemName', selectedPurchase.itemName);
      data.append('quantity', selectedPurchase.quantity);
      data.append('price', selectedPurchase.price);
      data.append('Firm', selectedPurchase.Firm);
      data.append('date', selectedPurchase.date);
      data.append('billNo', selectedPurchase.billNo);
      data.append('warrantyNumber', selectedPurchase.warrantyNumber || '');
      if (selectedPurchase.billFile instanceof File) {
        data.append('billFile', selectedPurchase.billFile);
      }

      await axios.put(`http://localhost:5000/api/purchases/${selectedPurchase._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Purchase updated successfully');
      setEditDialogOpen(false);
      fetchPurchases();
    } catch (err) {
      console.error('Failed to update purchase:', err);
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

  const handleSubmit = async () => {
    const { pen, itemName, quantity, price, Firm, date, billNo, billFile, warrantyNumber } = formData;
    if (!itemName || !quantity || !price || !Firm || !date || !billNo) {
      return alert('Please fill all required fields.');
    }

    const data = new FormData();
    data.append('pen', pen);
    data.append('itemName', itemName);
    data.append('quantity', quantity);
    data.append('price', price);
    data.append('Firm', Firm);
    data.append('date', date);
    data.append('billNo', billNo);
    data.append('warrantyNumber', warrantyNumber);
    if (billFile) data.append('billFile', billFile);

    try {
      await axios.post('http://localhost:5000/api/purchases', data);
      alert('Purchase added successfully');
      setFormData({
        pen,
        itemName: '',
        quantity: '',
        price: '',
        Firm: '',
        date: '',
        billNo: '',
        billFile: null,
        warrantyNumber: ''
      });
      fetchPurchases();
    } catch (err) {
      console.error('Error adding purchase:', err);
      alert('Failed to add purchase');
    }
  };

  const columns = [
    { field: 'enteredBy', headerName: 'Entered By', flex: 1 },
    { field: 'itemName', headerName: 'Item Name', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'price', headerName: 'Price (₹)', flex: 1 },
    { field: 'Firm', headerName: 'Firm', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'billNo', headerName: 'Bill No', flex: 1 },
    { field: 'warrantyNumber', headerName: 'Warranty Number', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 3,
      renderCell: (params) => (
        <>
          <Button size="small" variant="outlined" onClick={() => handleViewBill(params.row._id)}>View</Button>
          <Button size="small" variant="outlined" onClick={() => handleEditClick(params.row)} style={{ marginLeft: '8px' }}>Edit</Button>
          <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteClick(params.row)} style={{ marginLeft: '8px' }}>Delete</Button>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      {showAll ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2>All Purchase Entries</h2>
            <Button variant="outlined" onClick={() => setShowAll(false)}>Back to Purchase Form</Button>
          </div>
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
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Purchase Entry</h2>
            <Button variant="contained" color="primary" onClick={() => setShowAll(true)}>View All</Button>
          </div>

          <div className="form-grid">
            <input type="text" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} />
            <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} />
            <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} />
            <input type="text" name="Firm" placeholder="Firm" value={formData.Firm} onChange={handleChange} />
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
            <input type="text" name="billNo" placeholder="Bill Number" value={formData.billNo} onChange={handleChange} />
            <input type="text" name="warrantyNumber" placeholder="Warranty Number (Optional)" value={formData.warrantyNumber} onChange={handleChange} />
            <input type="file" name="billFile" accept="application/pdf,image/*" onChange={handleChange} />
            <button onClick={handleSubmit}>Add Purchase</button>
          </div>
        </>
      )}

      {/* View Bill Dialog */}
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
          <input type="text" name="itemName" value={selectedPurchase?.itemName || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, itemName: e.target.value })} placeholder="Item Name" />
          <input type="number" name="quantity" value={selectedPurchase?.quantity || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, quantity: e.target.value })} placeholder="Quantity" />
          <input type="number" name="price" value={selectedPurchase?.price || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, price: e.target.value })} placeholder="Price" />
          <input type="text" name="Firm" value={selectedPurchase?.Firm || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, Firm: e.target.value })} placeholder="Firm" />
          <input type="date" name="date" value={selectedPurchase?.date?.substring(0, 10) || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, date: e.target.value })} />
          <input type="text" name="billNo" value={selectedPurchase?.billNo || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, billNo: e.target.value })} placeholder="Bill No" />
          <input type="text" name="warrantyNumber" value={selectedPurchase?.warrantyNumber || ''} onChange={(e) => setSelectedPurchase({ ...selectedPurchase, warrantyNumber: e.target.value })} placeholder="Warranty Number (Optional)" />
          <input type="file" name="billFile" accept="application/pdf,image/*" onChange={(e) => setSelectedPurchase({ ...selectedPurchase, billFile: e.target.files[0] })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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

export default Purchase;
