import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import StudentEvaluationPage from './pages/StudentEvaluationPage';
import HRLoginPage from './pages/HRLoginPage';
import HRDashboardPage from './pages/HRDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/student/evaluation"
            element={<StudentEvaluationPage />}
          />
          <Route path="/hr/login" element={<HRLoginPage />} />
          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute>
                <HRDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
