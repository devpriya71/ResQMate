import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { connectAlertsSocket, disconnectAlertsSocket, onAlertEvent } from './services/alertsSocket';
import { isAuthenticated } from './utils/auth.js';
import ProtectedRoute from './components/Shared/ProtectedRoute.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SOSPage from './pages/SOSPage.jsx';
import DonationPage from './pages/DonationPage.jsx';
import VolunteerHubPage from './pages/VolunteerHubPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import TrustedContactsPage from './pages/TrustedContactsPage.jsx';

function App() {
  useEffect(() => {
    // Connect WebSocket when app starts
    const ws = connectAlertsSocket();

    // Subscribe to events
    const unsubscribeSOS = onAlertEvent('new_sos', (payload) => {
      console.log('New SOS received:', payload);
      // TODO: update your SOS state here
    });

    const unsubscribeDonation = onAlertEvent('new_donation', (payload) => {
      console.log('New Donation received:', payload);
      // TODO: update your Donation state here
    });

    const unsubscribeVolunteer = onAlertEvent('volunteer_assigned', (payload) => {
      console.log('Volunteer assigned:', payload);
      // TODO: update relevant SOS/Donation state here
    });

    // Cleanup on unmount
    return () => {
      unsubscribeSOS();
      unsubscribeDonation();
      unsubscribeVolunteer();
      disconnectAlertsSocket();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sos"
            element={
              <ProtectedRoute>
                <SOSPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <DonationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer-hub"
            element={
              <ProtectedRoute>
                <VolunteerHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trusted-contacts"
            element={
              <ProtectedRoute>
                <TrustedContactsPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<LandingPage />} />

          {/* Catch all */}
          <Route
            path="*"
            element={
              isAuthenticated()
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
