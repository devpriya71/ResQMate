import React, { useState, useEffect } from 'react';
import { AlertTriangle, Gift, Users, Clock, TrendingUp } from 'lucide-react';
import { dashboardAPI, sosAPI, donationAPI } from '../../utils/api';
import Loader from '../Shared/Loader.jsx';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sos, setSos] = useState([]);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const [sosData, donationData] = await Promise.all([
        sosAPI.getAll(),
        donationAPI.getAll(),
      ]);
      setSos(Array.isArray(sosData) ? sosData : []);
      setDonations(Array.isArray(donationData) ? donationData : []);

      const activeAlerts = (Array.isArray(sosData) ? sosData : []).filter(a => !a.resolved).length;
      const tasksCompleted = (Array.isArray(sosData) ? sosData : []).filter(a => !!a.resolved).length;
      const volunteerNames = new Set();
      (Array.isArray(sosData) ? sosData : []).forEach(a => {
        if (a.volunteer) volunteerNames.add(a.volunteer);
        if (Array.isArray(a.volunteers)) a.volunteers.forEach(v => volunteerNames.add(v));
      });
      (Array.isArray(donationData) ? donationData : []).forEach(d => {
        if (d.volunteer) volunteerNames.add(d.volunteer);
      });
      const donationsReceived = (Array.isArray(donationData) ? donationData : []).length;

      setStats({ activeAlerts, tasksCompleted, volunteersActive: volunteerNames.size, donationsReceived });
    } catch (error) {
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const isWithinHours = (ts, h) => {
    const t = new Date(ts).getTime();
    const now = Date.now();
    return now - t <= h * 3600 * 1000;
  };
  const isWithinDays = (ts, d) => {
    const t = new Date(ts).getTime();
    const now = Date.now();
    return now - t <= d * 24 * 3600 * 1000;
  };
  const formatRelativeTime = (ts) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Alerts',
      value: stats?.activeAlerts ?? 0,
      icon: AlertTriangle,
      color: 'red',
      trend: '+12%',
    },
    {
      title: 'Tasks Completed',
      value: stats?.tasksCompleted ?? 0,
      icon: Clock,
      color: 'green',
      trend: '+8%',
    },
    {
      title: 'Volunteers Active',
      value: stats?.volunteersActive ?? 0,
      icon: Users,
      color: 'blue',
      trend: '+5%',
    },
    {
      title: 'Donations Received',
      value: stats?.donationsReceived ?? 0,
      icon: Gift,
      color: 'purple',
      trend: '+18%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            red: 'bg-red-500 text-red-600 bg-red-50',
            green: 'bg-green-500 text-green-600 bg-green-50',
            blue: 'bg-blue-500 text-blue-600 bg-blue-50',
            purple: 'bg-purple-500 text-purple-600 bg-purple-50',
          };
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-soft card-appear">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colorClasses[stat.color].split(' ')[2]} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colorClasses[stat.color].split(' ')[1]}`} />
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{stat.trend}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-soft card-appear">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-4">
            {(() => {
              const within3h = sos.filter(a => !a.resolved && isWithinHours(a.timestamp, 3));
              const base = within3h.length ? within3h : sos.filter(a => !a.resolved && isWithinDays(a.timestamp, 3));
              const list = base.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0,5);
              if (!list.length) return <p className="text-sm text-gray-500">No recent active alerts.</p>;
              return list.map(alert => (
                <div key={alert.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg card-soft">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600">{formatRelativeTime(alert.timestamp)}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-soft card-appear">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Donations</h3>
          <div className="space-y-4">
            {(() => {
              const base = donations.filter(d => isWithinDays(d.timestamp, 3));
              const list = base.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0,5);
              if (!list.length) return <p className="text-sm text-gray-500">No recent donations.</p>;
              return list.map(d => (
                <div key={d.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg card-soft">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Gift className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{d.item}</p>
                    <p className="text-sm text-gray-600">{formatRelativeTime(d.timestamp)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${!d.volunteer ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {!d.volunteer ? 'Available' : 'Assigned'}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;