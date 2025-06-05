import React, { useEffect, useState } from 'react';
import axios from 'axios';



const FuelAdmin = () => {
  const [fuelEntries, setFuelEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFuelEntries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fuel');
        setFuelEntries(response.data);
      } catch (error) {
        console.error('Error fetching fuel entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFuelEntries();
  }, []);

  if (loading) {
    return <div className="loading">Loading fuel entries...</div>;
  }

  return (
    <div className="fuel-admin-container">
      <h2>Fuel Entry Review</h2>
      <div className="table-wrapper">
        <table className="fuel-table">
          <thead>
            <tr>
              <th>Vehicle/User</th>
              <th>Date</th>
              <th>Present KM</th>
              <th>Previous KM</th>
              <th>KMPL</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Bill No</th>
              <th>Full Tank</th>
              <th>Bill</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fuelEntries.map((entry) => (
              <tr key={entry._id}>
                <td>{entry.user?.name || 'N/A'}</td>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.presentKm}</td>
                <td>{entry.previousKm}</td>
                <td>{entry.kmpl}</td>
                <td>{entry.quantity}</td>
                <td>{entry.amount}</td>
                <td>{entry.billNo}</td>
                <td>{entry.fullTank}</td>
                <td>
                  {entry.filePath ? (
                    <a href={`http://localhost:5000/${entry.filePath}`} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className={`status ${entry.status?.toLowerCase() || 'pending'}`}>
                  {entry.status || 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FuelAdmin;
