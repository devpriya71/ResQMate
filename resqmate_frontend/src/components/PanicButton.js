import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // A common toast library

const PanicButton = ({ token }) => {
    const [isSending, setIsSending] = useState(false);

    const triggerAlert = async () => {
        // Prevent multiple clicks while the request is being sent
        if (isSending) {
            return;
        }
        setIsSending(true);

        // Get user's current location using the browser's Geolocation API
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            setIsSending(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Ensure a valid token exists
                if (!token) {
                    toast.error('Authentication token not found.');
                    setIsSending(false);
                    return;
                }

                await axios.post('http://localhost:8000/api/safety-alerts/', {
                    alert_type: 'distress_signal',
                    location_lat: latitude,
                    location_lon: longitude,
                }, {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                });
                toast.success('Alert sent to your trusted contacts!');
            } catch (error) {
                console.error('Error triggering alert:', error);
                toast.error('Failed to send alert.');
            } finally {
                // Reset the button state whether the request succeeded or failed
                setIsSending(false);
            }
        });
    };

    return (
        <button onClick={triggerAlert} disabled={isSending}>
            <img src="/assets/siren-icon.svg" alt="Panic Button" className="siren-icon" />
            <span>{isSending ? 'Sending...' : 'Panic Button'}</span>
        </button>
    );
};

export default PanicButton;