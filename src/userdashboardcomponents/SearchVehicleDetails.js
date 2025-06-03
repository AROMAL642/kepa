import React, { useState } from 'react';


function SearchVehicleDetails({ themeStyle }) {
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!vehicleNo.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/searchvehicle?number=${vehicleNo}`);

      if (!res.ok) {
        throw new Error('Vehicle not found');
      }

      const data = await res.json();
      setVehicleData(data);
    } catch (err) {
      setVehicleData(null);
      setError(err.message || 'Error fetching vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setVehicleNo(e.target.value.toUpperCase());
  };

  return (
    <div className="vehicle-search-container" style={themeStyle}>
      <h2 className="vehicle-search-title">Vehicle Search</h2>

      <div className="vehicle-search-form">
        <div className="vehicle-input-group">
          <label htmlFor="vehicleNo">Enter Vehicle Number:</label>
          <input
            id="vehicleNo"
            type="text"
            value={vehicleNo}
            onChange={handleInputChange}
            className="vehicle-input"
            placeholder="e.g. KL01AB1234"
            pattern="[A-Z]{2}\d{2}[A-Z]{2}\d{4}"
            title="Format: XX00XX0000 (e.g., KL01AB1234)"
            maxLength={10}
          />
        </div>
        <button className="vehicle-search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        {error && <p className="vehicle-error">{error}</p>}
      </div>

      {vehicleData && (
        <div className="vehicle-result-card">
          <h3>Vehicle Details</h3>
          <p><strong>Vehicle No:</strong> {vehicleData.number}</p>
          <p><strong>Type:</strong> {vehicleData.type}</p>
          <p><strong>Model:</strong> {vehicleData.model}</p>
          <p><strong>Fuel Type:</strong> {vehicleData.fuelType}</p>
          <p><strong>Status:</strong> {vehicleData.status}</p>
          <p><strong>Arrived Date:</strong> {vehicleData.arrivedDate}</p>
          <p><strong>Current Driver:</strong> {vehicleData.currentDriver}</p>
          <p><strong>Record Created At:</strong> {new Date(vehicleData.createdAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default SearchVehicleDetails;
