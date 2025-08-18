import React from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Login from '../components/Auth/Login.jsx';
import { isAuthenticated } from '../utils/auth.js';

const LoginPage = () => {
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <Login onSuccess={handleSuccess} />
    </div>
  );
};

export default LoginPage;