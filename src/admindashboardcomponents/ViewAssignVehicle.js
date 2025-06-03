import React, { useState } from 'react';

function AssignVehicle({ themeStyle, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeAssignUserPen, setActiveAssignUserPen] = useState(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleResults, setVehicleResults] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a name or PEN');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/assignvehicle/search?q=${searchTerm}`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (userPen) => {
    if (activeAssignUserPen === userPen) {
      setActiveAssignUserPen(null); // Toggle off
    } else {
      setActiveAssignUserPen(userPen); // Show vehicle search for this PEN
      setVehicleSearch('');
      setVehicleResults([]);
    }
  };

  const handleVehicleSearch = async () => {
    if (!vehicleSearch.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/assignvehicle/vehicle/search?q=${vehicleSearch}`);

      if (!res.ok) throw new Error('Failed to search vehicles');
      const data = await res.json();
      setVehicleResults(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching vehicles');
    }
  };

  const handleConfirmAssign = async (vehicleNumber, userPen) => {
    try {
    
      const res = await fetch('http://localhost:5000/api/assignvehicle/assign', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vehicleNumber: vehicleNumber.toUpperCase(), pen: userPen }),
});



      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assignment failed');

      alert(`Vehicle ${vehicleNumber} assigned to PEN: ${userPen}`);
      handleSearch(); // Refresh user data
      setActiveAssignUserPen(null); // Close vehicle search UI
    } catch (error) {
         console.error('Assign error:', error);
         alert('Error assigning vehicle: ' + error.message);
    }
  };






  return (
    <div className="assign-vehicle-container" style={themeStyle}>
      <button className="back-button" onClick={onBack}>⬅ Back</button>
      <h2>Assign Vehicle</h2>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by Name or PEN"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      {results.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>PEN</th>
              <th>Mobile No</th>
              <th>Vehicle Assign Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((user, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td>
                    <img
                      src={user.photo || 'https://via.placeholder.com/50'}
                      alt="User"
                      className="user-photo"
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.pen}</td>
                  <td>{user.phone}</td>
                  <td style={{ color: user.assignedVehicle ? 'green' : 'red' }}>
                    {user.assignedVehicle || 'Not Assigned'}
                  </td>
                  <td>
                    <button
                      style={{
                        backgroundColor: user.assignedVehicle ? 'red' : 'blue',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleAssignClick(user.pen)}
                    >
                      {user.assignedVehicle ? 'Reassign' : 'Assign'}
                    </button>
                  </td>
                </tr>

                {activeAssignUserPen === user.pen && (
                  <tr>
                    <td colSpan="6" style={{ backgroundColor: '#f5f5f5' }}>
                      <div style={{ padding: '10px' }}>
                        <input
                          type="text"
                          placeholder="Search vehicle number..."
                          value={vehicleSearch}
                          onChange={(e) => setVehicleSearch(e.target.value)}
                        />
                        <button onClick={handleVehicleSearch} style={{ marginLeft: '10px' }}>
                          Search Vehicle
                        </button>

                        {vehicleResults.length > 0 && (
                          <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                            {vehicleResults.map((v, i) => (
                              <li key={i} style={{ marginBottom: '5px' }}>
                                <strong>{v.number}</strong> ({v.model}) - {v.status}
                                <button
                                  style={{
                                    marginLeft: '10px',
                                    backgroundColor: 'green',
                                    color: 'white',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => handleConfirmAssign(v.number, user.pen)}
                                >
                                  Confirm
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AssignVehicle;
