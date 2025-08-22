import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, MapPin, Clock, User, Image, CheckCircle, AlertOctagon } from 'lucide-react';
import Loader from '../Shared/Loader.jsx';
import { AlertsContext } from '../../AlertsContext.jsx';
import { sosAPI } from '../../utils/api';

const SOSList = ({ onCreateNew }) => {
  const { sosList, setSosList } = useContext(AlertsContext); // use context state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Only fetch initial data once, and save to context
    const fetchSOSList = async () => {
      setLoading(true);
      try {
        const data = await sosAPI.getAll();
        setSosList(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSOSList();
  }, [setSosList]);

  // React to global search from Topbar
  useEffect(() => {
    const handler = (e) => setQuery((e.detail || '').toLowerCase());
    window.addEventListener('app:search', handler);
    return () => window.removeEventListener('app:search', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return sosList;
    return sosList.filter(s => (
      (s.title || '').toLowerCase().includes(query) ||
      (s.description || '').toLowerCase().includes(query) ||
      (s.type || '').toLowerCase().includes(query) ||
      (Array.isArray(s.volunteers) && s.volunteers.join(' ').toLowerCase().includes(query))
    ));
  }, [sosList, query]);

  const getStatusColor = (resolved) => {
    return resolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getPriorityColor = (type, severity) => {
    const base = {
      medical: 'border-red-500 bg-red-50',
      fire: 'border-orange-500 bg-orange-50',
      natural_disaster: 'border-purple-500 bg-purple-50',
      accident: 'border-blue-500 bg-blue-50',
      other: 'border-gray-500 bg-gray-50'
    }[type] || 'border-gray-500 bg-gray-50';
    const ring = {
      low: 'ring-green-200',
      medium: 'ring-yellow-200',
      high: 'ring-orange-200',
      critical: 'ring-red-300'
    }[severity] || '';
    return `${base} ${ring}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="large" text="Loading SOS alerts..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">SOS Alerts</h2>
        <button
          onClick={onCreateNew}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 btn-soft"
        >
          <AlertTriangle className="w-5 h-5" />
          <span>Create SOS</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((sos) => (
          <div
            key={sos.id}
            className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(sos.type, sos.severity)} p-6 transition-shadow duration-200 card-soft card-appear`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">{sos.title}</h3>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(!!sos.resolved)}`}>
                {sos.resolved ? 'resolved' : 'active'}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{sos.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <a
                  href={`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-800"
                >
                  Lat: {sos.latitude}, Lng: {sos.longitude}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date(sos.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {sos.image && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Image className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Image attached</span>
                </div>
                <img
                  src={sos.image.startsWith('http') ? sos.image : `http://localhost:8000${sos.image}`}
                  alt="SOS Evidence"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {(sos.volunteers && sos.volunteers.length > 0) ? (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                <User className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Volunteers: <strong>{sos.volunteers.join(', ')}</strong>
                </span>
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Severity: <strong className="capitalize">{sos.severity}</strong></div>
              <div className="flex items-center space-x-2">
                {sos.resolved ? (
                  <span className="flex items-center text-green-700 text-sm"><CheckCircle className="w-4 h-4 mr-1" /> Resolved</span>
                ) : (
                  <span className="flex items-center text-yellow-700 text-sm"><AlertOctagon className="w-4 h-4 mr-1" /> Active</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sosList.length === 0 && !loading && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No SOS alerts</h3>
          <p className="text-gray-600">All clear! No emergency alerts at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default SOSList;
