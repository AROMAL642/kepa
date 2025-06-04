import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MovementForm() {
  const [formData, setFormData] = useState({
    vehicleno: '',
    pen: '',
    tripdate: '',
    startingtime: '',
    startingkm: '',
    destination: '',
    purpose: ''
  });

  // Pre-fill PEN from localStorage and trip date
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const pen = user?.pen || '';

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    setFormData(prev => ({
      ...prev,
      pen: pen,
      tripdate: formattedDate
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/movement/start', {
        vehicleno: formData.vehicleno,
        startingkm: formData.startingkm,
        startingdate: formData.tripdate,
        startingtime: formData.startingtime,
        destination: formData.destination,
        purpose: formData.purpose,
        pen: formData.pen
      });

      alert('Movement entry saved');
      console.log(response.data);
      setFormData({
        vehicleno: '',
        pen: formData.pen,
        tripdate: formData.tripdate,
        startingtime: '',
        startingkm: '',
        destination: '',
        purpose: ''
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error saving movement');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px' }}>
      <h3>Start Vehicle Movement</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="vehicleno" placeholder="Vehicle Number" value={formData.vehicleno} onChange={handleChange} required /><br /><br />
        <input type="text" name="pen" placeholder="PEN Number"  /><br /><br />
        <input type="text" name="tripdate" value={formData.tripdate} readOnly /><br /><br />
        <input type="time" name="startingtime" value={formData.startingtime} onChange={handleChange} required /><br /><br />
        <input type="number" name="startingkm" placeholder="Starting KM" value={formData.startingkm} onChange={handleChange} required /><br /><br />
        <input type="text" name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} required /><br /><br />
        <input type="text" name="purpose" placeholder="Purpose" value={formData.purpose} onChange={handleChange} required /><br /><br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default MovementForm;
