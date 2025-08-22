import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Topbar from '../components/Shared/Topbar.jsx';
import { helpRequestAPI } from '../utils/api';
import { AlertCircle, MapPin, Phone, Send, ClipboardList, ShieldAlert } from 'lucide-react';

const Pill = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-full text-sm border transition-all ${
      active ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
    }`}
    aria-pressed={active}
  >
    {label}
  </button>
);

const RequestHelpPage = () => {
  const [needType, setNeedType] = useState('medical');
  const [urgency, setUrgency] = useState('high');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [coords, setCoords] = useState({ lat: '', lon: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [gettingLoc, setGettingLoc] = useState(false);

  useEffect(() => {
    // Try to get geolocation for the user to simplify input
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6),
        });
      },
      () => {
        // ignore geolocation errors for privacy/fallback
      },
      { enableHighAccuracy: true, maximumAge: 20000, timeout: 6000 }
    );
  }, []);

  const needOptions = [
    { key: 'medical', label: 'Medical' },
    { key: 'safety', label: 'Safety' },
    { key: 'food', label: 'Food' },
    { key: 'shelter', label: 'Shelter' },
    { key: 'transport', label: 'Transport' },
    { key: 'other', label: 'Other' },
  ];

  const urgencyOptions = [
    { key: 'low', label: 'Low' },
    { key: 'medium', label: 'Medium' },
    { key: 'high', label: 'High' },
    { key: 'critical', label: 'Critical' },
  ];

  const resetForm = () => {
    setNeedType('medical');
    setUrgency('high');
    setDescription('');
    setLocationText('');
    setContactPhone('');
    // keep coords if available
  };

  const useMyLocation = () => {
    setGettingLoc(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setGettingLoc(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6),
        });
        setGettingLoc(false);
      },
      () => {
        setError('Unable to get location. Please enter coordinates manually.');
        setGettingLoc(false);
      },
      { enableHighAccuracy: true, maximumAge: 20000, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        need_type: needType,
        urgency,
        description: description.trim(),
        location_text: locationText.trim(),
        latitude: coords.lat ? Number(coords.lat) : null,
        longitude: coords.lon ? Number(coords.lon) : null,
        contact_phone: contactPhone.trim(),
      };

      await helpRequestAPI.create(payload);
      setSuccess('Your request has been sent. We\'ll try out best to send the help as soon as we can .');
      resetForm();
      // Announce to other components if needed
      window.dispatchEvent(new CustomEvent('help-request:created'));
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <Topbar title="Request Help" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            {/* Header Card */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 md:p-8 shadow-lg text-white mb-6">
              <div className="flex items-start md:items-center md:space-x-4 flex-col md:flex-row">
                <div className="p-3 bg-white/10 rounded-xl mb-4 md:mb-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Need help? Submit a request</h1>
                  <p className="text-white/90 mt-1">Provide a few details so nearby volunteers and responders can assist you quickly.</p>
                </div>
              </div>
            </div>

            {/* Helper Callouts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 text-sm text-gray-700">
                  You can also browse current requests or see donations that might help your situation.
                </div>
                <div className="flex items-center gap-2">
                  <a href="/help-requests" className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">View requests</a>
                  <a href="/donations" className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">View donations</a>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              {/* Need Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">I need help with</label>
                <div className="flex flex-wrap gap-2">
                  {needOptions.map(opt => (
                    <Pill key={opt.key} label={opt.label} active={needType === opt.key} onClick={() => setNeedType(opt.key)} />
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Urgency</label>
                <div className="flex flex-wrap gap-2">
                  {urgencyOptions.map(opt => (
                    <Pill key={opt.key} label={opt.label} active={urgency === opt.key} onClick={() => setUrgency(opt.key)} />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">Describe your situation</label>
                <div className="relative">
                  <textarea
                    id="description"
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Example: I'm injured and need medical assistance. I am with two children."
                    className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none p-4 text-gray-900 placeholder-gray-400"
                  />
                  <ClipboardList className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-2">Location (landmark or address)</label>
                  <div className="relative">
                    <input
                      id="location"
                      type="text"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="Near central park gate 2, opposite hospital"
                      className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none p-3 pr-10"
                    />
                    <MapPin className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={coords.lat}
                      onChange={(e) => setCoords((c) => ({ ...c, lat: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none p-3"
                      placeholder="auto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={coords.lon}
                      onChange={(e) => setCoords((c) => ({ ...c, lon: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none p-3"
                      placeholder="auto"
                    />
                  </div>
                </div>
                </div>
                
                {/* Location helpers */}
                <div className="-mt-2 mb-6 flex items-center gap-4">
                <button
                type="button"
                onClick={useMyLocation}
                disabled={gettingLoc}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                <MapPin className="w-4 h-4" /> {gettingLoc ? 'Getting location…' : 'Use my location'}
                </button>
                {coords.lat && coords.lon ? (
                <a
                href={`https://www.google.com/maps?q=${coords.lat},${coords.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 underline"
                >
                Open in Google Maps
                </a>
                ) : null}
                </div>
                
                {/* Contact */}
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">Contact phone (optional)</label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none p-3 pr-10"
                  />
                  <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white shadow-sm transition-all ${
                    submitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Sending…' : 'Send Request'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>

              {/* Feedback */}
              {success && (
                <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                  {success}
                </div>
              )}
              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <div className="font-semibold">We couldn't send your request</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RequestHelpPage;
