import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Topbar from '../components/Shared/Topbar.jsx';
import { helpRequestAPI, donationAPI } from '../utils/api';
import { onAlertEvent } from '../services/alertsSocket';
import { Link } from 'react-router-dom';
import { AlertTriangle, Filter, MapPin, Clock, ArrowRight, HeartHandshake, Plus, ShieldAlert } from 'lucide-react';

const badgeColors = {
  medical: 'bg-rose-100 text-rose-700',
  safety: 'bg-amber-100 text-amber-700',
  food: 'bg-emerald-100 text-emerald-700',
  shelter: 'bg-indigo-100 text-indigo-700',
  transport: 'bg-sky-100 text-sky-700',
  other: 'bg-gray-100 text-gray-700',
};

const urgencyColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const Pill = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm border transition ${
      active ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

const HelpRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needFilter, setNeedFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [donations, setDonations] = useState([]);

  const needOptions = [
    { key: 'all', label: 'All' },
    { key: 'medical', label: 'Medical' },
    { key: 'safety', label: 'Safety' },
    { key: 'food', label: 'Food' },
    { key: 'shelter', label: 'Shelter' },
    { key: 'transport', label: 'Transport' },
    { key: 'other', label: 'Other' },
  ];

  const urgencyOptions = [
    { key: 'all', label: 'All' },
    { key: 'low', label: 'Low' },
    { key: 'medium', label: 'Medium' },
    { key: 'high', label: 'High' },
    { key: 'critical', label: 'Critical' },
  ];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [reqs, dons] = await Promise.all([
          helpRequestAPI.getAll(),
          donationAPI.getAll().catch(() => []),
        ]);
        setRequests(Array.isArray(reqs) ? reqs : []);
        setDonations(Array.isArray(dons) ? dons : []);
      } catch (e) {
        setError(e.message || 'Failed to load help requests');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    // Live updates via WebSocket
    const off = onAlertEvent('new_help_request', (payload) => {
      setRequests((prev) => [payload, ...prev]);
    });
    return () => { if (typeof off === 'function') off(); };
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (needFilter !== 'all' && r.need_type !== needFilter) return false;
      if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${r.description || ''} ${r.location_text || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, needFilter, urgencyFilter, query]);

  const formatTime = (ts) => new Date(ts).toLocaleString();

  const hasMatchingDonation = (req) => {
    const key = req.need_type || '';
    if (!donations || donations.length === 0) return false;
    const keywords = {
      food: ['food', 'grocer', 'meal', 'ration', 'rice', 'wheat', 'bread', 'water'],
      shelter: ['shelter', 'blanket', 'tent', 'mattress', 'bedding', 'pillow'],
      medical: ['med', 'first aid', 'bandage', 'medicine', 'kit', 'sanitizer'],
      transport: ['transport', 'ride', 'vehicle', 'fuel'],
      safety: ['safety', 'torch', 'flashlight', 'whistle', 'pepper'],
      other: [],
    };
    const words = keywords[key] || [];
    return donations.some((d) => {
      const item = (d.item || '').toLowerCase();
      if (words.length === 0) return false;
      return words.some((w) => item.includes(w));
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <Topbar title="Help Requests" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-lg mb-6">
              <div className="flex items-start md:items-center md:space-x-4 flex-col md:flex-row">
                <div className="p-3 bg-white/10 rounded-xl mb-4 md:mb-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold">Requests near you</h1>
                  <p className="mt-1 text-white/90">Browse and respond to help requests. New requests appear in real-time.</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link to="/request-help" className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:shadow transition">
                    <Plus className="w-5 h-5" />
                    Request Help
                  </Link>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 text-gray-700 mb-3"><Filter className="w-4 h-4" /> Filters</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex flex-wrap items-center gap-2">
                  {needOptions.map((opt) => (
                    <Pill key={opt.key} label={opt.label} active={needFilter === opt.key} onClick={() => setNeedFilter(opt.key)} />
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {urgencyOptions.map((opt) => (
                    <Pill key={opt.key} label={opt.label} active={urgencyFilter === opt.key} onClick={() => setUrgencyFilter(opt.key)} />
                  ))}
                </div>
                <div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search description or location..."
                    className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none p-3"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-600">Loading help requests…</div>
            ) : error ? (
              <div className="bg-white border border-red-200 rounded-2xl p-6 text-red-700">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
                <div className="text-gray-700 font-medium">No help requests found.</div>
                <div className="text-gray-500 mt-1 text-sm">Try changing filters, or create a new request.</div>
                <Link to="/request-help" className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700">
                  <Plus className="w-5 h-5" /> Request Help
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColors[r.need_type] || badgeColors.other}`}>
                          {r.need_type?.charAt(0).toUpperCase() + r.need_type?.slice(1)}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${urgencyColors[r.urgency] || urgencyColors.low}`}>
                          {r.urgency?.charAt(0).toUpperCase() + r.urgency?.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {formatTime(r.timestamp)}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-gray-900 font-semibold mb-1 truncate">{(r.description || 'No description').slice(0, 80)}</div>
                      {r.location_text && (
                        <div className="text-sm text-gray-600 flex items-center gap-1"><MapPin className="w-4 h-4" /> {r.location_text}</div>
                      )}
                      {r.latitude && r.longitude && (
                        <div className="mt-1">
                          <a
                            href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-600 underline"
                          >
                            Open location in Google Maps
                          </a>
                        </div>
                      )}

                      {hasMatchingDonation(r) && (
                        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-start gap-2">
                          <HeartHandshake className="w-5 h-5 mt-0.5" />
                          <div className="text-sm">
                            Matching donations may be available.
                            <Link to="/donations" className="ml-1 font-semibold underline">View donations</Link>.
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="text-xs text-gray-500">Status: {r.status?.replace('_', ' ')}</div>
                      <Link to="/volunteer-hub" className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium">
                        Help now <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAB */}
          <Link to="/request-help" className="fixed md:hidden bottom-6 right-6 bg-red-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-red-700">
            <Plus className="w-6 h-6" />
          </Link>
        </main>
      </div>
    </div>
  );
};

export default HelpRequestsPage;
