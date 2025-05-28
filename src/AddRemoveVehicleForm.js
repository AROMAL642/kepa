import React from 'react';
import './css/admindashboard.css'; // reuse existing styles if needed

function AddRemoveVehicleForm() {
  return (
    <div className="form-section">
      <h2>Add or Remove Vehicle</h2>

      <form className="vehicle-form">
        <div className="form-group">
          <label>Vehicle Number</label>
          <input type="text" placeholder="Enter vehicle number" />
        </div>
        <div className="form-group">
          <label>Model</label>
          <input type="text" placeholder="Enter model" />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select>
            <option value="active">Active</option>
            <option value="decommissioned">Decommissioned</option>
          </select>
        </div>
        <div className="form-buttons">
          <button type="submit">Add Vehicle</button>
          <button type="button">Remove Vehicle</button>
        </div>
      </form>
    </div>
  );
}

export default AddRemoveVehicleForm;
