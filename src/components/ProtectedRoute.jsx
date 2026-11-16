import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './loading/LoadingScreen';

/**
 * Route guard component for protected HR administrative views.
 * Prevents unauthorized or unauthenticated access in compliance with system requirements.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <LoadingScreen
        message="Verifying institutional session"
        subMessage={'Secure staff access \u00B7 FEAS'}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/hr/login" state={{ from: location }} replace />;
  }

  return children;
}
