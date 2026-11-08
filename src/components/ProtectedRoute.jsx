import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component for protected HR administrative views.
 * Prevents unauthorized or unauthenticated access in compliance with system requirements.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/hr/login" state={{ from: location }} replace />;
  }

  return children;
}
