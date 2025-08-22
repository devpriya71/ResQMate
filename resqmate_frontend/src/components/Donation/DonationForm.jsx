import React, { useState } from 'react';
import { Gift, X, MapPin } from 'lucide-react';
import { donationAPI } from '../../utils/api';
import Loader from '../Shared/Loader.jsx';

const DonationForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    pickup_address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState({ lat: '', lon: '' });
  const [gettingLoc, setGettingLoc] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
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
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setCoords({ lat, lon });
        setFormData(prev => ({
          ...prev,
          pickup_address: prev.pickup_address
            ? `${prev.pickup_address}\n\nLocation: ${lat}, ${lon}\nGoogle Maps: https://www.google.com/maps?q=${lat},${lon}`
            : `Location: ${lat}, ${lon}\nGoogle Maps: https://www.google.com/maps?q=${lat},${lon}`,
        }));
        setGettingLoc(false);
      },
      () => {
        setError('Unable to get location. Please enter address manually.');
        setGettingLoc(false);
      },
      { enableHighAccuracy: true, maximumAge: 20000, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await donationAPI.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Gift className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Add Donation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item/Resource
            </label>
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200"
              placeholder="e.g., Food supplies, Medical kit, Blankets"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity/Details
            </label>
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200"
              placeholder="e.g., 10 units, 5kg, 1 box"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Address
            </label>
            <textarea
              name="pickup_address"
              value={formData.pickup_address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors duration-200 resize-none"
              placeholder="Full address where the donation can be collected"
              required
            />
            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                onClick={useMyLocation}
                disabled={gettingLoc}
                className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
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
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Loader size="small" text="" /> : 'Add Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;