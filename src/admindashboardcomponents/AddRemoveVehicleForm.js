import React, { useState } from 'react';
import axios from 'axios';
import '../css/BackButton.css';

function AddRemoveVehicleForm({ onBack }) {
  const [vehicle, setVehicle] = useState({
    number: '',
    model: '',
    type: 'LMV',
    fuelType: '',
    status: 'Active',
    arrivedDate: new Date().toISOString().split('T')[0],
    kmpl: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'number' ? value.toUpperCase() : value;
    setVehicle({ ...vehicle, [name]: newValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/vehicles', vehicle);
      alert('Vehicle added successfully');

      // Reset form
      setVehicle({
        number: '',
        model: '',
        type: 'LMV',
        fuelType: '',
        status: 'Active',
        arrivedDate: new Date().toISOString().split('T')[0],
        kmpl: '',
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error;
      if (errorMsg === 'Vehicle number already exists') {
        alert('Vehicle number already exists!');
      } else {
        alert('Failed to add vehicle: ' + (errorMsg || error.message));
      }
    }
  };

  return (
    <div className="vehicle-form-container">
      {onBack && (
        <button className="back-button" onClick={onBack} style={{ marginBottom: '10px' }}>
          ⬅ Back
        </button>
      )}

      <h2 className="form-title">Add New Vehicle</h2>
      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vehicle Number</label>
          <input
            type="text"
            name="number"
            placeholder="e.g., KL01AA1234 or KL01A0123"
            pattern="[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}"
            title="Format: KL08BP0111 or KL08B0111"
            value={vehicle.number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Model and Year</label>
          <input
            type="text"
            name="model"
            placeholder="Enter model with Year"
            value={vehicle.model}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Vehicle Type</label>
          <select name="type" value={vehicle.type} onChange={handleChange} required>
            <option value="LMV">LMV</option>
            <option value="MMV">MMV</option>
            <option value="HMV">HMV</option>
            <option value="MPV">MPV</option>
            <option value="HPV">HPV</option>
            <option value="HGV">HGV</option>
            <option value="MGV">MGV</option>
            <option value="MCWG">MCWG</option>
            <option value="MCWOG">MCWOG</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fuel Type</label>
          <select name="fuelType" value={vehicle.fuelType} onChange={handleChange} required>
            <option value="">Select Fuel Type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={vehicle.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        <div className="form-group">
          <label>Arrived Date</label>
          <input
            type="date"
            name="arrivedDate"
            value={vehicle.arrivedDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>KMPL</label>
          <input
            type="number"
            name="kmpl"
            placeholder="Kilometers per liter"
            value={vehicle.kmpl}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-add">Add Vehicle</button>
        </div>
      </form>
    </div>
  );
}

export default AddRemoveVehicleForm;
