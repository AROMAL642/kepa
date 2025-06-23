// NotificationPage.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationPage = ({ onTabSelect }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const responses = await Promise.all([
          fetch('http://localhost:5000/api/fuel-pending-count'),
          fetch('http://localhost:5000/api/accident-pending-count'),
          fetch('http://localhost:5000/api/repair/pending/count'),
          fetch('http://localhost:5000/api/unverified-users'),
        ]);

        const [fuelRes, accidentRes, repairRes, unverifiedRes] = await Promise.all(
          responses.map((res) => res.json())
        );

        const notifs = [];

        if (fuelRes.count > 0) notifs.push({ tab: 'Fuel', count: fuelRes.count });
        if (accidentRes.count > 0) notifs.push({ tab: 'Accident', count: accidentRes.count });
        if (repairRes.count > 0) notifs.push({ tab: 'Repair', count: repairRes.count });
        if (unverifiedRes.length > 0) notifs.push({ tab: 'Request', count: unverifiedRes.length });

        setNotifications(notifs);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  const handleViewClick = (tab) => {
    if (onTabSelect) onTabSelect(tab);
    navigate('/admindashboard');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Pending Requests</h2>
      {notifications.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Module</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Pending Count</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.tab}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.count}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  <button onClick={() => handleViewClick(item.tab)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default NotificationPage;
