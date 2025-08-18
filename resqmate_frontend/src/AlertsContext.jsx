import React, { createContext, useState, useEffect } from 'react';
import alertsSocket from './services/alertsSocket.js';

export const AlertsContext = createContext();

export const AlertsProvider = ({ children }) => {
  const [sosList, setSosList] = useState([]);
  const [donationList, setDonationList] = useState([]);

  useEffect(() => {
    // Connect once
    const ws = alertsSocket.connectAlertsSocket();

    const offSOS = alertsSocket.onAlertEvent('new_sos', (payload) => {
      setSosList(prev => [payload, ...prev]); // ✅ update context
    });

    const offDonation = alertsSocket.onAlertEvent('new_donation', (payload) => {
      setDonationList(prev => [payload, ...prev]); // ✅ update context
    });

    const offVolunteer = alertsSocket.onAlertEvent('volunteer_assigned', (payload) => {
      if (payload.type === 'sos') {
        setSosList(prev =>
          prev.map(sos =>
            sos.id === payload.id ? { ...sos, status: 'assigned', volunteer: payload.volunteer } : sos
          )
        );
      } else if (payload.type === 'donation') {
        setDonationList(prev =>
          prev.map(d => (d.id === payload.id ? { ...d, volunteer: payload.volunteer } : d))
        );
      }
    });

    return () => {
      offSOS();
      offDonation();
      offVolunteer();
      alertsSocket.disconnectAlertsSocket();
    };
  }, []);

  return (
    <AlertsContext.Provider value={{ sosList, setSosList, donationList, setDonationList }}>
      {children}
    </AlertsContext.Provider>
  );
};
