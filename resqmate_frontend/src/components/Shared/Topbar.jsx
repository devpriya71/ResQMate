import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserData, getAuthToken } from '../../utils/auth';
import { onAlertEvent } from '../../services/alertsSocket';

const Topbar = ({ title = 'Dashboard' }) => {
  const user = getUserData();
  const [query, setQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const unread = notifications.filter(n => !n.read).length;
  const boxRef = useRef(null);
  const isVolunteer = useMemo(() => user?.role === 'volunteer', [user]);
  const API_BASE_URL = 'http://localhost:8000/api';

  // Broadcast search query so pages can filter their lists
  useEffect(() => {
    const ev = new CustomEvent('app:search', { detail: query });
    window.dispatchEvent(ev);
  }, [query]);

  // Subscribe to server events to build notifications (especially for volunteers)
  useEffect(() => {
    const off = [];
    const addNotif = (type, payload) => {
      const title = type === 'new_sos' ? (payload?.title || 'New SOS') : (payload?.item || 'New Donation');
      setNotifications(prev => [{
        id: `${type}-${payload?.id || Date.now()}`,
        type,
        title,
        timestamp: payload?.timestamp || new Date().toISOString(),
        read: false,
      }, ...prev].slice(0, 30));
    };
    // Always listen, but mainly used by volunteers per requirement
    off.push(onAlertEvent('new_sos', (p) => addNotif('new_sos', p)));
    off.push(onAlertEvent('new_donation', (p) => addNotif('new_donation', p)));
    off.push(onAlertEvent('volunteer_assigned', (p) => addNotif('volunteer_assigned', p)));
    
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      off.forEach(fn => fn && fn());
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch profile avatar for navbar
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const headers = { 'Accept': 'application/json' };
    const scheme = token.includes('.') ? 'Bearer' : 'Token';
    headers['Authorization'] = `${scheme} ${token}`;
    const base = API_BASE_URL.replace('/api','');
    const toAbs = (u) => (!u ? null : (u.startsWith('http') || u.startsWith('blob:') || u.startsWith('data:')) ? u : `${base}${u.startsWith('/') ? u : '/' + u}`);

    fetch(`${API_BASE_URL}/auth/me/`, { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.avatar) setAvatarUrl(toAbs(data.avatar));
      })
      .catch(() => {});

    const onProfileUpdated = (e) => {
      const u = e?.detail?.avatar;
      if (u) setAvatarUrl(toAbs(u) + `?t=${Date.now()}`);
    };
    window.addEventListener('profile:updated', onProfileUpdated);
    return () => window.removeEventListener('profile:updated', onProfileUpdated);
  }, []);

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString();
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4 relative" ref={boxRef}>
        <div className="relative w-40 md:w-64">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-9 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none w-full"
          />
          {query && (
            <button
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        
        {isVolunteer && (
          <>
            <button
              className="relative p-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
              onClick={() => setShowNotif((v) => !v)}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {(unread > 0) && (
                <span className="absolute -top-1 -right-1 min-w-[0.75rem] h-3 px-1 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center">{unread}</span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-12 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">Notifications</div>
                  <button onClick={markAllAsRead} className="text-xs text-red-600 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 text-sm border-b border-gray-50 ${n.read ? 'bg-white' : 'bg-red-50'}`}>
                      <div className="font-medium text-gray-900">{n.title}</div>
                      <div className="text-xs text-gray-500">{n.type.replace('_', ' ')} • {formatTime(n.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <Link to="/profile" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center overflow-hidden group-hover:bg-red-200 transition-colors">
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : user?.username ? (
              <span className="text-red-700 font-semibold">{user.username.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="w-5 h-5 text-red-600" />
            )}
          </div>
          <span className="hidden md:inline text-sm font-medium text-gray-700 group-hover:text-red-700">
            {user?.username || 'User'}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Topbar;