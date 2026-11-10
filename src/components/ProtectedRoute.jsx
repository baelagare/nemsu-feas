import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard component for protected HR administrative views.
 * Prevents unauthorized or unauthenticated access in compliance with system requirements.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 border-4 border-[#0B2545] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-600">Verifying institutional session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/hr/login" state={{ from: location }} replace />;
  }

  return children;
}
