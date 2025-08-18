import React from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Topbar from '../components/Shared/Topbar.jsx';
import Dashboard from '../components/Dashboard/Dashboard.jsx';

const DashboardPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={() => window.location.href = '/login'} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <Topbar title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;