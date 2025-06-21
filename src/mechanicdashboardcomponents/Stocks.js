import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import '../css/stocks.css';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDataGrid, setShowDataGrid] = useState(false);

  const [formData, setFormData] = useState({
    itemType: '',
    itemName: '',
    serialNo: '',
    quantity: '',
    condition: '',
    status: '',
    warranty: '',
    warrantyNumber: '',
    date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'warranty' && value === 'No' ? { warrantyNumber: '' } : {})
    }));
  };

  const handleAddOrUpdateStock = async () => {
    const { itemType, itemName, serialNo, quantity, condition, status, warranty, warrantyNumber, date } = formData;

    if (!itemType || !itemName || !serialNo || !quantity || !condition || !status || !warranty || !date || (warranty === 'Yes' && !warrantyNumber)) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      itemType,
      itemName,
      serialNo,
      quantity: Number(quantity),
      condition,
      status,
      hasWarranty: warranty === 'Yes',
      warrantyNumber: warranty === 'Yes' ? warrantyNumber : '',
      date,
      lastUpdated: new Date().toLocaleString(),
      warranty
    };

    if (editingId !== null) {
      setStocks(prev => prev.map(item => item.id === editingId ? { ...payload, id: editingId } : item));
      alert('Stock updated successfully');
    } else {
      setStocks(prev => [...prev, { ...payload, id: Date.now() }]);
      alert('Stock added successfully');
    }

    setFormData({
      itemType: '',
      itemName: '',
      serialNo: '',
      quantity: '',
      condition: '',
      status: '',
      warranty: '',
      warrantyNumber: '',
      date: ''
    });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      setStocks(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleEdit = (id) => {
    const itemToEdit = stocks.find(item => item.id === id);
    if (itemToEdit) {
      setFormData({
        itemType: itemToEdit.itemType,
        itemName: itemToEdit.itemName,
        serialNo: itemToEdit.serialNo,
        quantity: itemToEdit.quantity,
        condition: itemToEdit.condition,
        status: itemToEdit.status,
        warranty: itemToEdit.warranty,
        warrantyNumber: itemToEdit.warrantyNumber,
        date: itemToEdit.date
      });
      setEditingId(id);
    }
  };

  const columns = [
    { field: 'itemType', headerName: 'Type', width: 120 },
    { field: 'itemName', headerName: 'Name', width: 150 },
    { field: 'serialNo', headerName: 'Serial No', width: 150 },
    { field: 'quantity', headerName: 'Qty', width: 90 },
    { field: 'condition', headerName: 'Condition', width: 120 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'warranty', headerName: 'Warranty', width: 110 },
    { field: 'warrantyNumber', headerName: 'Warranty No', width: 130 },
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'lastUpdated', headerName: 'Last Updated', width: 160 }
  ];

  const rows = stocks.map((item) => ({
    id: item.id,
    itemType: item.itemType,
    itemName: item.itemName,
    serialNo: item.serialNo,
    quantity: item.quantity,
    condition: item.condition,
    status: item.status,
    warranty: item.warranty,
    warrantyNumber: item.warranty === 'Yes' ? item.warrantyNumber : 'N/A',
    date: item.date,
    lastUpdated: item.lastUpdated
  }));

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Spare Part Stocks</h2>
        <button
          onClick={() => setShowDataGrid(prev => !prev)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showDataGrid ? 'Hide Grid View' : 'View Full Stock'}
        </button>
      </div>

      {/* Stock Form */}
      <div className="form-grid">
        <select name="itemType" value={formData.itemType} onChange={handleChange}>
          <option value="">Select Type</option>
          <option value="Spare Part">Spare Part</option>
          <option value="Battery">Battery</option>
          <option value="Oil">Oil</option>
          <option value="Tyre">Tyre</option>
        </select>

        <input type="text" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} />
        <input type="text" name="serialNo" placeholder="Serial Number" value={formData.serialNo} onChange={handleChange} />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} />

        <select name="condition" value={formData.condition} onChange={handleChange}>
          <option value="">Condition</option>
          <option value="New">New</option>
          <option value="Used">Used</option>
          <option value="Damaged">Damaged</option>
        </select>

        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="">Status</option>
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="Damaged">Damaged</option>
        </select>

        <select name="warranty" value={formData.warranty} onChange={handleChange}>
          <option value="">Warranty</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        {formData.warranty === 'Yes' && (
          <input
            type="text"
            name="warrantyNumber"
            placeholder="Warranty Number"
            value={formData.warrantyNumber}
            onChange={handleChange}
          />
        )}

        <input type="date" name="date" value={formData.date} onChange={handleChange} />

        <button onClick={handleAddOrUpdateStock}>
          {editingId !== null ? 'Update Stock' : 'Add Stock'}
        </button>
      </div>

      {/* Stock Table or DataGrid */}
      {showDataGrid ? (
        <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
          />
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Serial No</th>
                <th>Qty</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Warranty</th>
                <th>Warranty No</th>
                <th>Date</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(item => (
                <tr key={item.id}>
                  <td>{item.itemType}</td>
                  <td>{item.itemName}</td>
                  <td>{item.serialNo}</td>
                  <td>{item.quantity}</td>
                  <td>{item.condition}</td>
                  <td>{item.status}</td>
                  <td>{item.warranty}</td>
                  <td>{item.warranty === 'Yes' ? item.warrantyNumber : 'N/A'}</td>
                  <td>{item.date}</td>
                  <td>{item.lastUpdated}</td>
                  <td>
                    <button onClick={() => handleEdit(item.id)}>Edit</button>
                    <button onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {stocks.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center' }}>
                    No stock items added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stocks;
