import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/PageTransition';
import LoadingScreen from './components/loading/LoadingScreen';
import LandingPage from './pages/LandingPage';

// Heavier pages are code-split and shown behind a branded loading screen.
const StudentEvaluationPage = lazy(() => import('./pages/StudentEvaluationPage'));
const HRLoginPage = lazy(() => import('./pages/HRLoginPage'));
const HRDashboardPage = lazy(() => import('./pages/HRDashboardPage'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen message="Loading page" />}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/student/evaluation" element={<StudentEvaluationPage />} />
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
          </PageTransition>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
