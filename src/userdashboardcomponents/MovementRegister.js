import React, { useState, useEffect } from 'react';
import axios from 'axios';






function MovementRegister() {
  const [formData, setFormData] = useState({
    vehicleno: '',
    startingkm: '',
    startingdate: '',
    startingtime: '',
    destination: '',
    purpose: '',
    pen: '' 
  });

  // Get user info from localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log('User from localStorage:', user); 
    const pen = user?.pen || '';

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    setFormData(prevData => ({
      ...prevData,
      pen,
      startingdate: formattedDate
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Add console.log to verify the formData before sending
    console.log('Submitting form data:', formData);
    
    const response = await axios.post('http://localhost:5000/api/movement', formData);
    alert(response.data.message || 'Movement saved successfully');
  } catch (error) {
    console.error('Error submitting movement:', error);
    alert(error.response?.data?.message || 'Failed to save movement data.');
  }
};

  return (
    <div className="movement-container">
      <h2>Movement Form</h2>
      <form onSubmit={handleSubmit} className="movement-form">
        <div className="form-group">
          <label>Vehicle Number</label>
          <input
            type="text"
            name="vehicleno"
            value={formData.vehicleno}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Starting KM</label>
          <input
            type="text"
            name="startingkm"
            value={formData.startingkm}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Starting Date</label>
          <input
            type="text"
            name="startingdate"
            value={formData.startingdate}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>Starting Time</label>
          <input
            type="time"
            name="startingtime"
            value={formData.startingtime}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Destination</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Purpose</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          />
        </div>

        {/* Hidden PEN input (not editable, but sent to backend) */}
        <input type="hidden" name="pen" value={formData.pen} />

        <button type="submit" className="submit-btn">Submit Movement</button>
      </form>
    </div>
  );
}

export default MovementRegister;
