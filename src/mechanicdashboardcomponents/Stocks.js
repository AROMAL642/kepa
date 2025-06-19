import React, { useState } from 'react';
import '../css/stocks.css';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [formData, setFormData] = useState({
    itemType: '',
    itemName: '',
    serialNo: '',
    quantity: '',
    condition: '',
    status: '',
    warranty: '',
    warrantyNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'warranty' && value === 'No' ? { warrantyNumber: '' } : {})
    }));
  };

  const handleAddStock = async () => {
    const { itemType, itemName, serialNo, quantity, condition, status, warranty, warrantyNumber } = formData;

    if (!itemType || !itemName || !serialNo || !quantity || !condition || !status || !warranty || (warranty === 'Yes' && !warrantyNumber)) {
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
      warrantyNumber: warranty === 'Yes' ? warrantyNumber : ''
    };

    try {
      const response = await fetch('http://localhost:5000/api/stocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setStocks(prev => [...prev, { ...payload, warranty, id: Date.now() }]);
        alert('Stock added successfully');
        setFormData({
          itemType: '',
          itemName: '',
          serialNo: '',
          quantity: '',
          condition: '',
          status: '',
          warranty: '',
          warrantyNumber: ''
        });
      } else {
        alert(data.message || 'Failed to add stock');
      }
    } catch (err) {
      console.error('Error adding stock:', err);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Manage Spare Part Stocks</h2>

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

        <button onClick={handleAddStock}>Add Stock</button>
      </div>

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
              </tr>
            ))}
            {stocks.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No stock items added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Stocks;
