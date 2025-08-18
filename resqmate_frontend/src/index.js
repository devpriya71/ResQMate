import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AlertsProvider } from './AlertsContext.jsx';
import { AuthProvider } from './AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AlertsProvider>
        <App />
      </AlertsProvider>
    </AuthProvider>
  </React.StrictMode>
);
