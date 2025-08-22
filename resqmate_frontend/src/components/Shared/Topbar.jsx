import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, User, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserData, getAuthToken } from '../../utils/auth';
import { onAlertEvent } from '../../services/alertsSocket';
import PanicButton from '../PanicButton';

const Topbar = ({ title = 'Dashboard' }) => {
  const user = getUserData();
  const [query, setQuery] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const boxRef = useRef(null);
  const isVolunteer = useMemo(() => user?.role === 'volunteer', [user]);
  const API_BASE_URL = 'http://localhost:8000/api';

  // Broadcast search query
  useEffect(() => {
    const ev = new CustomEvent('app:search', { detail: query });
    window.dispatchEvent(ev);
  }, [query]);

  // Notifications subscription
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

  // Fetch avatar
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
  const formatTime = (ts) => new Date(ts).toLocaleString();

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-4 md:px-6">
        {/* Left: Mobile menu button + title */}
        <div className="flex items-center space-x-2">
          <button
            className="md:hidden p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="hidden md:block text-xl md:text-2xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Center + Right: Panic button, Search, Notifications, Avatar */}
        <div className="flex flex-1 items-center space-x-3 md:space-x-4 relative" ref={boxRef}>

          {/* Search bar */}
          <div className="hidden md:block relative w-64">
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

          {/* Notifications (only for volunteers) */}
          {isVolunteer && (
            <>
              <button
                className="relative p-2 text-gray-600 hover:text-red-600 transition-colors duration-200 j-"
                onClick={() => setShowNotif((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
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

          {/* Spacer to push avatar to right */}
          <div className="flex-1" />

{/* Panic button */}
            <div className="mr-2">
            <PanicButton small token={getAuthToken()} trustedContacts={(() => {
              try { return JSON.parse(localStorage.getItem('trustedContacts') || '[]'); } catch { return []; }
            })()} />
          </div>
          {/* Avatar */}
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

      {/* Mobile search & avatar row */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-gray-100">
        {/* Mobile search */}
        <div className="relative flex-1 mr-2">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-3 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-out translate-x-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">Menu</div>
              <button className="p-2 rounded hover:bg-gray-50" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <nav className="p-2">
              <Link to="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Home</Link>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Dashboard</Link>
              <Link to="/sos" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">SOS Alerts</Link>
              <Link to="/request-help" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Request Help</Link>
              <Link to="/donations" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Donations</Link>
              <Link to="/help-requests" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Help Requests</Link>
              <Link to="/volunteer-hub" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Volunteer Hub</Link>
              <Link to="/trusted-contacts" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Trusted Contacts</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50">Profile</Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;

