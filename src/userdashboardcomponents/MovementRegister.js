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

  const [movementId, setMovementId] = useState(null); // to store movement ID after first submission
  const [showSecondForm, setShowSecondForm] = useState(false);
  const [endData, setEndData] = useState({
    endingtime: '',
    endingkm: '',
    officerincharge: ''
  });

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

  const handleEndChange = (e) => {
    const { name, value } = e.target;
    setEndData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitStart = async (e) => {
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

      alert('Starting movement entry saved');
      setMovementId(response.data._id); // Store the movement ID
      setShowSecondForm(true);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error saving movement');
    }
  };

  const handleSubmitEnd = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/movement/end/${formData.vehicleno}`, {
        endingtime: endData.endingtime,
        endingkm: endData.endingkm,
        officerincharge: endData.officerincharge
      });

      alert('Movement completed');
      setShowSecondForm(false);
      setMovementId(null);

      // Reset all form states
      setFormData({
        vehicleno: '',
        pen: formData.pen,
        tripdate: formData.tripdate,
        startingtime: '',
        startingkm: '',
        destination: '',
        purpose: ''
      });
      setEndData({
        endingtime: '',
        endingkm: '',
        officerincharge: ''
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Error updating movement');
    }
  };

  return (
    <div className="movement-form-container">
      <h3 className="form-heading">Start Vehicle Movement</h3>
      <form onSubmit={handleSubmitStart} className="movement-form">
        <div className="form-group">
          <input type="text" name="vehicleno" placeholder="Vehicle Number" value={formData.vehicleno} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input type="text" name="pen" placeholder="PEN Number" value={formData.pen} readOnly />
        </div>
        <div className="form-group">
          <input type="text" name="tripdate" value={formData.tripdate} readOnly />
        </div>
        <div className="form-group">
          <input type="time" name="startingtime" value={formData.startingtime} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input type="number" name="startingkm" placeholder="Starting KM" value={formData.startingkm} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input type="text" name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <input type="text" name="purpose" placeholder="Purpose" value={formData.purpose} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn">Submit Start</button>
      </form>

      {showSecondForm && (
        <form onSubmit={handleSubmitEnd} className="movement-form" style={{ marginTop: '40px' }}>
          <h3 className="form-heading">End Vehicle Movement</h3>
          <div className="form-group">
            <input type="time" name="endingtime" placeholder="Ending Time" value={endData.endingtime} onChange={handleEndChange} required />
          </div>
          <div className="form-group">
            <input type="number" name="endingkm" placeholder="Ending KM" value={endData.endingkm} onChange={handleEndChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="officerincharge" placeholder="Officer In Charge" value={endData.officerincharge} onChange={handleEndChange} required />
          </div>
          <button type="submit" className="submit-btn">Submit End</button>
        </form>
      )}
    </div>
  );
}

export default MovementForm;
