// frontend/src/mechanicdashboardcomponents/Stocks.js
import React, { useState, useEffect } from 'react';
import '../css/stocks.css';
import axios from 'axios';

const Stocks = ({ onViewAll }) => {
  const [formData, setFormData] = useState({
    pen: '',
    itemType: '',
    itemName: '',
    serialNo: '',
    quantity: '',
    condition: '',
    status: '',
    warranty: '',
    warrantyNumber: '',
    date: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('adminData');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData((prev) => ({ ...prev, pen: user.pen }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'warranty' && value === 'No' ? { warrantyNumber: '' } : {}),
    }));
  };

  const handleSubmit = async () => {
    const {
      pen, itemType, itemName, serialNo, quantity,
      condition, status, warranty, warrantyNumber, date
    } = formData;

    if (!itemType || !itemName || !serialNo || !quantity || !condition || !status || !warranty || (warranty === 'Yes' && !warrantyNumber) || !date) {
      alert("Please fill all required fields including Date");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/stockroutes', {
        pen,
        itemType,
        itemName,
        serialNo,
        quantity: Number(quantity),
        condition,
        status,
        hasWarranty: warranty === 'Yes',
        warrantyNumber: warranty === 'Yes' ? warrantyNumber : '',
        date: new Date(date).toISOString()
      });

      alert("✅ Stock item added successfully");

      setFormData({
        pen,
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
    } catch (err) {
      alert("❌ Failed to add stock item");
      console.error("Backend error:", err);
    }
  };

  return (
    <div className="stock-form-container">
      <div className="stock-form-header">
        <h2>Manage Stock Register</h2>
        <button className="view-all-btn" onClick={onViewAll}>📦 View All Stocks</button>
      </div>

      <div className="form-grid">
        <select name="itemType" value={formData.itemType} onChange={handleChange}>
          <option value="">Select Type</option>
          <option value="Spare Part">Spare Part</option>
          <option value="Battery">Battery</option>
          <option value="Oil">Oil</option>
          <option value="Tyre">Tyre</option>
        </select>

        <input type="text" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} />
        <input type="text" name="serialNo" placeholder="Serial No." value={formData.serialNo} onChange={handleChange} />
        <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} />
        <input type="date" name="date" value={formData.date} onChange={handleChange} />

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

        <button onClick={handleSubmit}>➕ Add Stock</button>
      </div>
    </div>
  );
};

export default Stocks;