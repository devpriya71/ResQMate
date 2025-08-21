 import React, { useEffect, useRef, useState } from 'react';

// PanicButton: shows a 5s countdown modal; on finish, calls 112, opens SMS app with location,
// and attempts to notify backend (if endpoint exists). Designed to be subtle and safe.
// Props:
// - token?: auth token (string)
// - trustedContacts?: array of phone numbers as strings
// - small?: boolean (render compact pill/button)
const PanicButton = ({ token = null, trustedContacts = [], small = false }) => {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [coords, setCoords] = useState(null);
  const timerRef = useRef(null);

  const getLocation = () => new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });

  const smsUri = (numbers, message) => {
    if (!numbers || numbers.length === 0) return null;
    const joined = numbers.join(',');
    // Try generic sms: uri with body
    return `sms:${joined}?body=${encodeURIComponent(message)}`;
  };

  const doNotifyBackend = async (location) => {
    try {
      if (!token) return;
      const headers = { 'Content-Type': 'application/json', 'Authorization': (token.includes('.') ? 'Bearer ' : 'Token ') + token };
      await fetch('http://localhost:8000/api/safety-alerts/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          alert_type: 'distress_signal',
          location_lat: location?.lat ?? null,
          location_lon: location?.lon ?? null,
        })
      });
    } catch {}
  };

  const act = async () => {
    setBusy(true);
    const location = coords || await getLocation();
    const gmaps = location ? `https://maps.google.com/?q=${location.lat},${location.lon}` : '';
    const msg = `EMERGENCY! I need help. ${location ? 'My location: ' + gmaps : ''}`;

    // 1) Try to call emergency number 112 (works on mobile)
    try { window.location.href = 'tel:112'; } catch {}

    // 2) Try to open SMS composer to trusted contacts
    const uri = smsUri(trustedContacts, msg);
    if (uri) {
      try { window.location.href = uri; } catch {}
    }

    // 3) Notify backend if available
    await doNotifyBackend(location);

    setBusy(false);
    setOpen(false);
    setCount(5);
  };

  const startCountdown = async () => {
    // Pre-fetch location quickly
    getLocation().then(setCoords);
    setOpen(true);
    setCount(5);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          act();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setOpen(false);
    setCount(5);
  };

  const sendNow = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    act();
  };

  useEffect(() => () => timerRef.current && clearInterval(timerRef.current), []);

  const Btn = (
    <button
      onClick={startCountdown}
      disabled={busy}
      className={`${small ? 'w-9 h-9 rounded-full text-xs' : 'px-4 py-2 rounded-lg text-sm'} bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors btn-soft`}
      aria-label="Panic button"
      title="Panic button"
    >
      {small ? 'SOS' : 'Panic Button'}
    </button>
  );

  return (
    <>
      {Btn}
      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 card-appear">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sending Emergency Alert</h3>
            <p className="text-sm text-gray-600 mb-4">Calling 112 and messaging your trusted contacts in:</p>
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-red-200 flex items-center justify-center">
                <div className="text-3xl font-extrabold text-red-600">{count}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={cancel} className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={sendNow} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Send now</button>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">Location access helps responders find you faster.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default PanicButton;
