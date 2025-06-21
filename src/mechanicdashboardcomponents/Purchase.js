import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/stocks.css'; // Reuse same styling
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
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    price: '',
    vendor: '',
    billNo: '',
    billFile: null
  });

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/purchases');
      setPurchases(res.data);
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

  const handleSubmit = async () => {
    const { itemName, quantity, price, vendor, billNo, billFile } = formData;
    if (!itemName || !quantity || !price || !vendor || !billNo) {
      return alert('Please fill all required fields.');
    }

    const data = new FormData();
    data.append('itemName', itemName);
    data.append('quantity', quantity);
    data.append('price', price);
    data.append('vendor', vendor);
    data.append('billNo', billNo);
    if (billFile) data.append('billFile', billFile);

    try {
      const res = await axios.post('http://localhost:5000/api/purchases', data);
      alert('Purchase added successfully');
      setFormData({ itemName: '', quantity: '', price: '', vendor: '', billNo: '', billFile: null });
      fetchPurchases();
    } catch (err) {
      console.error('Error adding purchase:', err);
      alert('Failed to add purchase');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Purchase Entry</h2>

      <div className="form-grid">
        <input type="text" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} />
        <input type="text" name="vendor" placeholder="Vendor" value={formData.vendor} onChange={handleChange} />
        <input type="text" name="billNo" placeholder="Bill Number" value={formData.billNo} onChange={handleChange} />
        <input type="file" name="billFile" accept="application/pdf,image/*" onChange={handleChange} />

        <button onClick={handleSubmit}>Add Purchase</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Vendor</th>
              <th>Bill No</th>
              <th>Bill File</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(p => (
              <tr key={p._id}>
                <td>{p.itemName}</td>
                <td>{p.quantity}</td>
                <td>{p.price}</td>
                <td>{p.vendor}</td>
                <td>{p.billNo}</td>
                <td>
                  <a href={`http://localhost:5000/api/purchases/${p._id}/bill`} target="_blank" rel="noreferrer">
                    View Bill
                  </a>
                </td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No purchases yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchase;
