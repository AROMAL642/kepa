import React, { useState } from 'react';
import axios from 'axios';

function AddRemoveVehicleForm() {
  const [vehicle, setVehicle] = useState({
    number: '',
    model: '',
    type: 'car',
    status: 'active',
    arrivedDate: new Date().toISOString().split('T')[0],
    kmpl: '',
  });

  const handleChange = (e) => {
    setVehicle({ ...vehicle, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/vehicles', vehicle);
      alert('Vehicle added successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to add vehicle');
    }
  };

  return (
    <div className="vehicle-form-container">
      <h2 className="form-title">Add or Remove Vehicle</h2>

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Vehicle Number</label>
          <input
            type="text"
            name="number"
            placeholder="e.g., KL-10-AA-1234"
            pattern="[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}"
            title="Format: XX-00-XX-0000"
            value={vehicle.number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Model</label>
          <input
            type="text"
            name="model"
            placeholder="Enter model"
            value={vehicle.model}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Vehicle Type</label>
          <select name="type" value={vehicle.type} onChange={handleChange}>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="jeep">Jeep</option>
            <option value="minivan">Mini Van</option>
            <option value="bus">Bus</option>
          </select>
        </div>

        <div className="form-group">
          <label>Arrived Date</label>
          <input
            type="date"
            name="arrivedDate"
            value={vehicle.arrivedDate}
            onChange={handleChange}
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
