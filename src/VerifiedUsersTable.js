import React, { useEffect, useState } from 'react';

const VerifiedUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerifiedUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/verified-users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching verified users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        <p className="ml-4 text-blue-500 text-lg">Loading verified users...</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="text-center text-gray-600 mt-6">
        No verified users found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-2xl font-bold text-gray-800 p-4 border-b">Verified Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">PEN</th>
                <th className="px-6 py-3 text-left">General No</th>
                <th className="px-6 py-3 text-left">Mobile Number</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 border-t">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.pen}</td>
                  <td className="px-6 py-4">{user.generalNo}</td>
                  <td className="px-6 py-4">{user.phone}</td>
                  <td className="px-6 py-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                      View Full Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VerifiedUsersTable;
