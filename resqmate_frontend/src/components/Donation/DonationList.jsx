import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Gift, MapPin, Clock, User, Plus } from 'lucide-react';
import Loader from '../Shared/Loader.jsx';
import { AlertsContext } from '../../AlertsContext.jsx';
import { donationAPI } from '../../utils/api';

const DonationList = ({ onCreateNew }) => {
  const { donationList, setDonationList } = useContext(AlertsContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  // Fetch initial donations once
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      try {
        const data = await donationAPI.getAll();
        setDonationList(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [setDonationList]);

  // React to global search from Topbar
  useEffect(() => {
    const handler = (e) => setQuery((e.detail || '').toLowerCase());
    window.addEventListener('app:search', handler);
    return () => window.removeEventListener('app:search', handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return donationList;
    return donationList.filter(d => (
      (d.item || '').toLowerCase().includes(query) ||
      (d.pickup_address || '').toLowerCase().includes(query) ||
      (d.quantity || '').toString().toLowerCase().includes(query) ||
      (d.volunteer || '').toLowerCase().includes(query)
    ));
  }, [donationList, query]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'collected': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="large" text="Loading donations..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Donations</h2>
        <button
          onClick={onCreateNew}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 btn-soft"
        >
          <Plus className="w-5 h-5" />
          <span>Add Donation</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((donation) => (
          <div
            key={donation.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow duration-200 card-soft card-appear"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">{donation.item}</h3>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                {donation.status || 'pending'}
              </span>
            </div>

            {donation.image && (
              <img
                src={`http://localhost:8000/media/${donation.image}`}
                alt="Donation"
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="font-medium text-gray-900">{donation.quantity}</span>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm text-gray-600">Pickup Address:</span>
                  <p className="text-sm font-medium text-gray-900">{donation.pickup_address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{new Date(donation.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {donation.volunteer && (
              <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                <User className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Assigned to: <strong>{donation.volunteer}</strong>
                </span>
              </div>
            )}

            {!donation.volunteer && (
              <button className="w-full mt-3 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors duration-200">
                Available for pickup
              </button>
            )}
          </div>
        ))}
      </div>

      {donationList.length === 0 && !loading && (
        <div className="text-center py-12">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
          <p className="text-gray-600">Be the first to contribute to the community!</p>
        </div>
      )}
    </div>
  );
};

export default DonationList;
