import React from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Register from '../components/Auth/Register.jsx';
import { isAuthenticated } from '../utils/auth.js';

const RegisterPage = () => {
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <Register onSuccess={handleSuccess} />
    </div>
  );
};

export default RegisterPage;