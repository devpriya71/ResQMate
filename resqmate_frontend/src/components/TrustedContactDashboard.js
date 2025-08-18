// components/TrustedContactDashboard.js

import React from 'react';
import useSafetyAlerts from '../services/websocketService';
import Map from './Map';

const TrustedContactDashboard = () => {
    const token = localStorage.getItem('token'); // Get auth token
    const newAlert = useSafetyAlerts(token);

    // This state will store all alerts received to display them on the map
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (newAlert) {
            setAlerts(prevAlerts => [...prevAlerts, newAlert]);
            alert(`New Safety Alert from ${newAlert.user_name}!`);
        }
    }, [newAlert]);

    return (
        <div>
            <h2>Your Alerts</h2>
            <Map incidents={alerts} />
            {/* You can display a list of alerts here too */}
        </div>
    );
};

export default TrustedContactDashboard;