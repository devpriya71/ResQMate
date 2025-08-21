import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, MapPin, AlertTriangle, Gift } from 'lucide-react';
import { sosAPI, donationAPI } from '../../utils/api';
import Loader from '../Shared/Loader.jsx';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const EmergencyMap = () => {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default center (India)
  const [zoom, setZoom] = useState(5);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchMapData();
    getCurrentLocation();
  }, []);

  const fetchMapData = async () => {
    try {
      const [sosData, donationData] = await Promise.all([
        sosAPI.getAll(),
        donationAPI.getAll(),
      ]);
      // Ensure numeric lat/lng for map
      const normalizedSOS = (Array.isArray(sosData) ? sosData : []).map((s) => ({
        ...s,
        latitude: typeof s.latitude === 'string' ? parseFloat(s.latitude) : Number(s.latitude),
        longitude: typeof s.longitude === 'string' ? parseFloat(s.longitude) : Number(s.longitude),
      })).filter((s) => isFinite(s.latitude) && isFinite(s.longitude));

      setSosAlerts(normalizedSOS);
      setDonations(Array.isArray(donationData) ? donationData : []);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setZoom(12);
        },
        () => {}
      );
    }
  };

  const sosColor = (sos) => {
    if (sos.resolved) return '#16a34a'; // green
    switch (sos.severity) {
      case 'critical': return '#dc2626'; // red-600
      case 'high': return '#f97316'; // orange-500
      case 'medium': return '#eab308'; // yellow-500
      case 'low':
      default: return '#22c55e'; // green-500
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="large" text="Loading emergency map..." />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <MapIcon className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Emergency Map</h3>
      </div>

      <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
        <MapContainer whenCreated={(map)=>{ mapRef.current = map; setTimeout(()=> map.invalidateSize(), 0); }} center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {sosAlerts.map((sos) => (
            <CircleMarker
              key={`sos-${sos.id}`}
              center={[sos.latitude, sos.longitude]}
              radius={8}
              pathOptions={{ color: sosColor(sos), fillColor: sosColor(sos), fillOpacity: 0.6 }}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900">{sos.title}</div>
                  <div className="text-xs text-gray-600">{sos.description}</div>
                  <div className="text-xs text-gray-600">Severity: <span className="capitalize">{sos.severity || 'n/a'}</span></div>
                  <div className="text-xs text-gray-600">Status: {sos.resolved ? 'Resolved' : 'Active'}</div>
                  {Array.isArray(sos.volunteers) && sos.volunteers.length > 0 && (
                    <div className="text-xs text-gray-600">Volunteers: {sos.volunteers.join(', ')}</div>
                  )}
                  <div className="text-xs text-gray-500">Lat: {sos.latitude}, Lng: {sos.longitude}</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Map Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#dc2626' }}></span><span className="text-sm text-gray-700">SOS Critical</span></div>
            <div className="flex items-center space-x-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#f97316' }}></span><span className="text-sm text-gray-700">SOS High</span></div>
            <div className="flex items-center space-x-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></span><span className="text-sm text-gray-700">SOS Medium</span></div>
            <div className="flex items-center space-x-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#22c55e' }}></span><span className="text-sm text-gray-700">SOS Low</span></div>
            <div className="flex items-center space-x-2"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#16a34a' }}></span><span className="text-sm text-gray-700">Resolved</span></div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{sosAlerts.length}</p>
              <p className="text-sm text-gray-600">Active SOS</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{donations.length}</p>
              <p className="text-sm text-gray-600">Donations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Center */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;
