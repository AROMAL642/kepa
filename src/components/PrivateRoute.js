// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const admin = JSON.parse(localStorage.getItem('adminData'));

  if (!user && !admin) return <Navigate to="/" />;

  if (role === 'user' && user) return children;
  if (admin?.role === role) return children;

  return <Navigate to="/" />;
};

export default PrivateRoute;
