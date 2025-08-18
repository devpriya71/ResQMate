import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Gift, User, CheckCircle, Shield } from 'lucide-react';
import { sosAPI, donationAPI, volunteerAPI } from '../../utils/api';
import { connectAlertsSocket, disconnectAlertsSocket, onAlertEvent } from '../../services/alertsSocket';
import { getUserData, getAuthToken } from '../../utils/auth';
import Loader from '../Shared/Loader.jsx';

const VolunteerAssign = () => {
  const [sosList, setSosList] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(null);
  const [error, setError] = useState('');
  const [volunteerName, setVolunteerName] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [userUsername, setUserUsername] = useState('');

  useEffect(() => {
    // Get user role from localStorage
    const userData = getUserData();
    console.log('User data from localStorage:', userData);
    if (userData && userData.role) {
      setUserRole(userData.role);
      console.log('User role set to:', userData.role);
    } else {
      console.log('No user role found in localStorage');
    }

    // Set username and default volunteerName for volunteers
    if (userData && userData.username) {
      setUserUsername(userData.username);
      if (userData.role === 'volunteer') {
        setVolunteerName(userData.username);
      }
    }

    fetchData();
    
    const token = getAuthToken();
    const ws = connectAlertsSocket(token);
    const unsubs = [
      onAlertEvent('new_sos', handleNewSOS),
      onAlertEvent('new_donation', handleNewDonation),
      onAlertEvent('volunteer_assigned', handleVolunteerAssigned),
    ];

    return () => {
      unsubs.forEach((u) => u && u());
      disconnectAlertsSocket();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [sosData, donationData] = await Promise.all([
        sosAPI.getAll(),
        donationAPI.getAll(),
      ]);
      setSosList(sosData.filter(sos => !sos.volunteer));
      setDonations(donationData.filter(donation => !donation.volunteer));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSOS = (newSOS) => {
    if (!newSOS.volunteer) {
      setSosList(prev => [newSOS, ...prev]);
    }
  };

  const handleNewDonation = (newDonation) => {
    if (!newDonation.volunteer) {
      setDonations(prev => [newDonation, ...prev]);
    }
  };

  const handleVolunteerAssigned = (data) => {
    if (data.type === 'sos') {
      setSosList(prev => prev.filter(sos => sos.id !== data.id));
    } else if (data.type === 'donation') {
      setDonations(prev => prev.filter(donation => donation.id !== data.id));
    }
  };

  const handleAssign = async (type, id, itemTitle) => {
    console.log('handleAssign called with:', { type, id, itemTitle, volunteerName });
    
    if (!volunteerName.trim()) {
      setError('Please enter a volunteer name');
      return;
    }

    setAssignLoading(`${type}-${id}`);
    setError('');

    try {
      console.log('Calling volunteerAPI.assign with:', { type, id, volunteer: volunteerName });
      const response = await volunteerAPI.assign(type, id, volunteerName);
      console.log('Assignment response:', response);
      setVolunteerName('');
      // Items will be automatically removed from lists via socket event
    } catch (error) {
      console.error('Assignment error:', error);
      setError(error.message || 'Failed to assign volunteer');
    } finally {
      setAssignLoading(null);
    }
  };

  // If user is not a volunteer, show access denied message
  if (userRole && userRole !== 'volunteer') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h3>
          <p className="text-gray-500">Only volunteers can access the volunteer assignment hub.</p>
          <p className="text-sm text-gray-400 mt-2">Your role: {userRole}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="large" text="Loading volunteer assignments..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Volunteer Assignment Hub</h2>
        {userRole === 'volunteer' && (
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            Volunteer Access
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          
        </div>
      )}

      {/* Volunteer Name Input - Only show for volunteers */}
      {userRole === 'volunteer' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Be a Volunteer</h3>
          <div className="flex space-x-4">
            <input
              type="text"
              value={volunteerName}
              onChange={(e) => setVolunteerName(e.target.value)}
              placeholder="Enter volunteer name"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
            />
            <button
              type="button"
              onClick={() => setVolunteerName(userUsername)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Use my username
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Current volunteer: {volunteerName || 'None selected'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Unassigned SOS Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">Unassigned SOS Alerts</h3>
          <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
            {sosList.length}
          </span>
        </div>

        {sosList.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">All SOS alerts have been assigned!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sosList.map((sos) => (
              <div key={sos.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{sos.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{sos.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(sos.timestamp).toLocaleString()}
                  </p>
                </div>
                {userRole === 'volunteer' ? (
                  <button
                    onClick={() => handleAssign('sos', sos.id, sos.title)}
                    disabled={!volunteerName.trim() || assignLoading === `sos-${sos.id}`}
                    className="ml-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {assignLoading === `sos-${sos.id}` ? (
                      <Loader size="small" text="" />
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Assign</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="ml-4 text-sm text-gray-500">
                    Volunteer access required
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unassigned Donations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Unassigned Donations</h3>
          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
            {donations.length}
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600">All donations have been assigned for pickup!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {donations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{donation.item}</h4>
                  <p className="text-sm text-gray-600 mt-1">Quantity: {donation.quantity}</p>
                  <p className="text-sm text-gray-600">Address: {donation.pickup_address}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(donation.timestamp).toLocaleString()}
                  </p>
                </div>
                {userRole === 'volunteer' ? (
                  <button
                    onClick={() => handleAssign('donation', donation.id, donation.item)}
                    disabled={!volunteerName.trim() || assignLoading === `donation-${donation.id}`}
                    className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {assignLoading === `donation-${donation.id}` ? (
                      <Loader size="small" text="" />
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Assign</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="ml-4 text-sm text-gray-500">
                    Volunteer access required
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerAssign;