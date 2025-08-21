import React from 'react';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import { 
  Home, 
  AlertTriangle, 
  Gift, 
  Users, 
  MessageCircle, 
  Map,
  LogOut 
} from 'lucide-react';
import { logout } from '../../utils/auth';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/sos', icon: AlertTriangle, label: 'SOS Alerts' },
    { path: '/donations', icon: Gift, label: 'Donations' },
    { path: '/volunteer-hub', icon: Users, label: 'Volunteer Hub' },
    { path: '/trusted-contacts', icon: Users, label: 'Trusted Contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden md:block bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-40 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">ResQMate</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-all duration-200 hover:bg-red-50 hover:text-red-600 ${
                isActive 
                  ? 'bg-red-50 text-red-600 border-r-2 border-red-600' 
                  : 'text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;