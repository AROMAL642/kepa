import React, { useState } from 'react';


function AssignVehicle({ themeStyle, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
            </tr>
          </thead>
          <tbody>
            {results.map((user, idx) => (
              <tr key={idx}>
                <td>
                  <img
                    src={user.photo || 'https://via.placeholder.com/50'}
                    alt="User"
                    className="user-photo"
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.pen}</td>
                <td>{user.mobileno}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AssignVehicle;
