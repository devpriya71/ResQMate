import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Topbar from '../components/Shared/Topbar.jsx';
import { getAuthToken, getUserData, setUserData } from '../utils/auth';
import { User } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

const ProfilePage = () => {
  const local = getUserData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    username: local?.username || '',
    email: '',
    role: local?.role || 'victim',
    is_safety_user: false,
    avatar: null,
    avatar_url: null,
  });
  const [avatarFile, setAvatarFile] = useState(null);

  const authHeader = () => {
    const token = getAuthToken();
    if (!token) return null;
    const scheme = token.includes('.') ? 'Bearer' : 'Token';
    return `${scheme} ${token}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = { 'Accept': 'application/json' };
        const auth = authHeader();
        if (auth) headers['Authorization'] = auth;
        const res = await fetch(`${API_BASE_URL}/auth/me/`, { headers });
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        const base = API_BASE_URL.replace('/api','');
        const toAbs = (u) => (!u ? null : (u.startsWith('http') || u.startsWith('blob:') || u.startsWith('data:')) ? u : `${base}${u.startsWith('/') ? u : '/' + u}`);
        setProfile({
          username: data.username || local?.username || '',
          email: data.email || '',
          role: data.role || local?.role || 'victim',
          is_safety_user: !!data.is_safety_user,
          avatar: null,
          avatar_url: toAbs(data.avatar),
        });
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((p) => ({ ...p, avatar_url: url }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const form = new FormData();
      if (profile.email) form.append('email', profile.email);
      if (profile.role) form.append('role', profile.role);
            if (avatarFile) form.append('avatar', avatarFile);

      const headers = {};
      const auth = authHeader();
      if (auth) headers['Authorization'] = auth;

      const res = await fetch(`${API_BASE_URL}/auth/me/`, {
        method: 'PATCH',
        headers,
        body: form,
      });
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) throw new Error('Failed to update profile');
      const data = await res.json();
      const base = API_BASE_URL.replace('/api','');
      const toAbs = (u) => (!u ? null : (u.startsWith('http') || u.startsWith('blob:') || u.startsWith('data:')) ? u : `${base}${u.startsWith('/') ? u : '/' + u}`);
      setProfile((p) => ({
        ...p,
        email: data.email || '',
        role: data.role || p.role,
        is_safety_user: !!data.is_safety_user,
        avatar_url: data.avatar ? `${toAbs(data.avatar)}?t=${Date.now()}` : p.avatar_url,
      }));
      // sync local storage user role so rest of app reflects changes immediately
      const existing = getUserData() || {};
      setUserData({ ...existing, username: profile.username || existing.username, role: (data.role || profile.role) });
      setAvatarFile(null);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError(e.message || 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">Loading profile...</div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={() => window.location.href = '/login'} />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar title="My Profile" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  ) : profile.username ? (
                    <span className="text-2xl text-red-700 font-bold">{profile.username.charAt(0).toUpperCase()}</span>
                  ) : (
                    <User className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{profile.username || 'User'}</h2>
                  <p className="text-gray-500">Role: {profile.role || 'N/A'}</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
              )}
              {success && (
                <div className="mt-4 p-3 rounded border border-green-200 bg-green-50 text-green-700 text-sm">{success}</div>
              )}

              <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Account</h3>
                  <div className="text-sm text-gray-600 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Username</label>
                      <div className="mt-1">{profile.username || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Email</label>
                      <input name="email" type="email" value={profile.email} onChange={onChange} className="mt-1 w-full px-3 py-2 border rounded-lg" placeholder="you@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Role</label>
                      <select name="role" value={profile.role} onChange={onChange} className="mt-1 w-full px-3 py-2 border rounded-lg">
                        <option value="victim">Victim</option>
                        <option value="volunteer">Volunteer</option>
                      </select>
                    </div>
                                        <div>
                      <label className="block text-xs font-medium text-gray-500">Avatar</label>
                      <input type="file" accept="image/*" onChange={onAvatarChange} className="mt-1 w-full" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Update Profile</button>
                </div>
              </form>

              <div className="mt-6">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
