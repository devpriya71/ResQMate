import React from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Topbar from '../components/Shared/Topbar.jsx';
import VolunteerAssign from '../components/Volunteer/VolunteerAssign.jsx';
import EmergencyChat from '../components/Chat/EmergencyChat.jsx';
import EmergencyMap from '../components/Map/EmergencyMap.jsx';

const VolunteerHubPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={() => window.location.href = '/login'} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <Topbar title="Volunteer Hub" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <VolunteerAssign />
              <EmergencyMap />
            </div>
            <div className="xl:col-span-1">
              <EmergencyChat />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VolunteerHubPage;