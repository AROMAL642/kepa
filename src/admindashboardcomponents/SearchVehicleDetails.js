import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import '../css/SearchVehicleDetails.css';
import '../css/BackButton.css';

function SearchVehicleDetails({ themeStyle, onBack }) {
  const [vehicleNo, setVehicleNo] = useState('');
  const [vehicleData, setVehicleData] = useState(null);
  const [vehicleList, setVehicleList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewAll, setViewAll] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const handleInputChange = (e) => {
    setVehicleNo(e.target.value.toUpperCase());
  };

  const handleSearch = async () => {
    if (!vehicleNo.trim()) {
      setError('Please enter a vehicle number');
      return;
    }

    setError('');
    setLoading(true);
    setViewAll(false);

    try {
      const res = await fetch(`http://localhost:5000/searchvehicle?number=${vehicleNo}`);
      if (!res.ok) throw new Error('Vehicle not found');
      const data = await res.json();
      setVehicleData(data);
    } catch (err) {
      setVehicleData(null);
      setError(err.message || 'Error fetching vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = async () => {
    setError('');
    setLoading(true);
    setViewAll(true);

    try {
      const res = await fetch(`http://localhost:5000/vehicles`);
      if (!res.ok) throw new Error('Failed to fetch vehicle list');
      const data = await res.json();

      const formattedData = data.map((v, index) => ({
        id: v._id || index,
        number: v.number,
        type: v.type,
        model: v.model,
        fuelType: v.fuelType,
        status: v.status,
        kmpl: v.kmpl,
        arrivedDate: v.arrivedDate ? new Date(v.arrivedDate).toLocaleDateString() : '',
      }));

      setVehicleList(formattedData);
    } catch (err) {
      setVehicleList([]);
      setError(err.message || 'Error loading vehicle list');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (row) => {
    setViewAll(false);
    try {
      const res = await fetch(`http://localhost:5000/searchvehicle?number=${row.number}`);
      const data = await res.json();
      setVehicleData(data);
    } catch (err) {
      setError('Failed to load vehicle details');
    }
  };

  const handleRemoveVehicle = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to remove this vehicle?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete vehicle');

      setVehicleList(prev => prev.filter(vehicle => vehicle.id !== id));
    } catch (err) {
      setError(err.message || 'Error deleting vehicle');
    }
  };

  const handleStatusChangeClick = (id, currentStatus) => {
    setEditingStatusId(id);
    setNewStatus(currentStatus);
  };

  const handleUpdateStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/vehicles/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setVehicleList(prev =>
        prev.map(vehicle =>
          vehicle.id === id ? { ...vehicle, status: newStatus } : vehicle
        )
      );
      setEditingStatusId(null);
      setNewStatus('');
    } catch (err) {
      setError(err.message || 'Error updating vehicle status');
    }
  };

  const renderBase64Button = (base64, mimetype, label) => {
    if (!base64 || !mimetype) return null;

    try {
      const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: mimetype });
      const url = URL.createObjectURL(blob);

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '6px 12px',
            marginTop: '10px',
            marginRight: '10px',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          View {label}
        </a>
      );
    } catch (e) {
      return <p>Failed to render {label}</p>;
    }
  };

  const columns = [
    { field: 'number', headerName: 'Vehicle No', flex: 1.3 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'model', headerName: 'Model', flex: 1 },
    { field: 'fuelType', headerName: 'Fuel Type', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1.5 },
    { field: 'arrivedDate', headerName: 'Arrived Date', flex: 1 },
    { field: 'kmpl', headerName: 'KMPL', flex: 0.5 },
    {
      field: 'remove',
      headerName: 'Remove',
      flex: 1.5,
      renderCell: (params) => (
        <button
          onClick={() => handleRemoveVehicle(params.row.id)}
          style={{
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Remove Vehicle
        </button>
      ),
    },
    {
      field: 'changeStatus',
      headerName: 'Change Status',
      flex: 2.5,
      renderCell: (params) => (
        editingStatusId === params.row.id ? (
          <div style={{ display: 'flex', gap: '5px' }}>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Decommissioned">Decommissioned</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </select>
            <button
              onClick={() => handleUpdateStatus(params.row.id)}
              style={{
                backgroundColor: '#2e7d32',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px'
              }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleStatusChangeClick(params.row.id, params.row.status)}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Change
          </button>
        )
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 1.5,
      renderCell: (params) => (
        <button
          onClick={() => handleViewDetails(params.row)}
          style={{
            backgroundColor: '#0288d1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer'
          }}
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="vehicle-search-container" style={themeStyle}>
      <button className="back-button" onClick={onBack}>⬅ Back</button>
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
            maxLength={10}
          />
        </div>
        <button className="vehicle-search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button className="vehicle-search-btn" onClick={handleViewAll} disabled={loading}>
          {loading ? 'Loading...' : 'View All Vehicles'}
        </button>
        {error && <p className="vehicle-error">{error}</p>}
      </div>

      {!viewAll && vehicleData && (
        <div className="vehicle-result-card">
          <h3>Vehicle Details</h3>
          <p><strong>Vehicle No:</strong> {vehicleData.number}</p>
          <p><strong>Type:</strong> {vehicleData.type}</p>
          <p><strong>Model:</strong> {vehicleData.model}</p>
          <p><strong>Fuel Type:</strong> {vehicleData.fuelType}</p>
          <p><strong>Status:</strong> {vehicleData.status}</p>
          <p><strong>Arrived Date:</strong> {new Date(vehicleData.arrivedDate).toLocaleDateString()}</p>

          {vehicleData.insurancePolicyNo && <p><strong>Insurance Policy No:</strong> {vehicleData.insurancePolicyNo}</p>}
          {vehicleData.insuranceValidity && <p><strong>Insurance Validity:</strong> {new Date(vehicleData.insuranceValidity).toLocaleDateString()}</p>}
          {renderBase64Button(vehicleData.insuranceFile?.buffer, vehicleData.insuranceFile?.mimetype, 'Insurance Certificate')}

          {vehicleData.pollutionValidity && <p><strong>Pollution Validity:</strong> {new Date(vehicleData.pollutionValidity).toLocaleDateString()}</p>}
          {renderBase64Button(vehicleData.pollutionFile?.buffer, vehicleData.pollutionFile?.mimetype, 'Pollution Certificate')}
        </div>
      )}

      {viewAll && (
        <div style={{ height: 500, width: '100%', marginTop: '20px' }}>
          <DataGrid
            rows={vehicleList}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            sx={{ backgroundColor: themeStyle?.backgroundColor || '#fff', color: themeStyle?.color || '#000' }}
          />
        </div>
      )}
    </div>
  );
}

export default SearchVehicleDetails;
