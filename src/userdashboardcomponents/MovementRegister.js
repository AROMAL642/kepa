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

  const [endData, setEndData] = useState({
    endingtime: '',
    endingkm: '',
    officerincharge: '',
    tripenddate: '',
    endingdate: ''
  });

  const [step, setStep] = useState('vehicleno');
  const [loading, setLoading] = useState(false);

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

    setEndData(prev => ({
      ...prev,
      tripenddate: formattedDate
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = name === 'vehicleno' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleEndChange = (e) => {
    const { name, value } = e.target;
    setEndData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = async () => {
    if (!formData.vehicleno) {
      alert("Please enter a vehicle number");
      return;
    }

    const vehicleFormat = /^KL\d{2}[A-Z]{1,2}\d{4}$/;
    if (!vehicleFormat.test(formData.vehicleno)) {
      alert('Enter a valid vehicle number (e.g., KL01AA1234)');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.get(`http://localhost:5000/api/movement/active/${formData.vehicleno}/${formData.pen}`);
      if (res.data.active) {
        setStep('end');
        setFormData(prev => ({
          ...prev,
          startingkm: res.data.movement.startingkm,
          startingtime: res.data.movement.startingtime,
          destination: res.data.movement.destination,
          purpose: res.data.movement.purpose
        }));
      } else {
        setStep('start');
      }
    } catch (err) {
      console.error(err);
      alert("Error checking vehicle status");
    }

    setLoading(false);
  };

  const handleSubmitStart = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:5000/api/movement/start', {
        vehicleno: formData.vehicleno,
        startingkm: formData.startingkm,
        startingdate: formData.tripdate,
        startingtime: formData.startingtime,
        destination: formData.destination,
        purpose: formData.purpose,
        pen: formData.pen
      });

      alert("Movement started");
      setStep('end');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error starting movement");
    }
  };

  const handleSubmitEnd = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5000/api/movement/end/${formData.vehicleno}`, {
        endingtime: endData.endingtime,
        endingkm: endData.endingkm,
        officerincharge: endData.officerincharge,
        tripenddate: endData.tripenddate,
        endingdate: endData.endingdate
      });

      alert("Movement completed");

      // Reset form
      setFormData(prev => ({
        vehicleno: '',
        pen: prev.pen,
        tripdate: prev.tripdate,
        startingtime: '',
        startingkm: '',
        destination: '',
        purpose: ''
      }));

      setEndData({
        endingtime: '',
        endingkm: '',
        officerincharge: '',
        tripenddate: formData.tripdate
      });

      setStep('vehicleno');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error ending movement");
    }
  };

  return (
    <div className="movement-form-container">
      <h3 className="form-heading">Vehicle Movement Form</h3>

      {step === 'vehicleno' && (
        <div className="movement-form">
          <div className="form-group">
            <input
              type="text"
              name="vehicleno"
              placeholder="Vehicle Number"
              value={formData.vehicleno}
              onChange={handleChange}
              required
            />
          </div>
          <button onClick={handleContinue} disabled={loading} className="submit-btn">
            {loading ? "Checking..." : "Continue"}
          </button>
        </div>
      )}

      {step === 'start' && (
        <form onSubmit={handleSubmitStart} className="movement-form">
          <div className="form-group">
            <input type="text" name="pen" value={formData.pen} readOnly />
          </div>
          <div className="form-group">


            <input
              type="date"
              name="tripdate"
              placeholder="Trip Start Date (dd-mm-yyyy)"
              value={formData.tripdate}
              onChange={handleChange}
              required
            />
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
      )}

      {step === 'end' && (
        <form onSubmit={handleSubmitEnd} className="movement-form" style={{ marginTop: '40px' }}>

          <h3 className="form-heading">End Vehicle Movement</h3>
          <div className="form-group">
  <input
    type="date"
    name="endingdate"
    placeholder="Ending Date (DD-MM-YYYY)"
    value={endData.endingdate}
    onChange={handleEndChange}
    required
  />
</div>

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
