import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Topbar from '../components/Shared/Topbar.jsx';
import DonationList from '../components/Donation/DonationList.jsx';
import DonationForm from '../components/Donation/DonationForm.jsx';

const DonationPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onLogout={() => window.location.href = '/login'} />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <Topbar title="Donations" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <DonationList onCreateNew={() => setShowForm(true)} />
          {showForm && (
            <DonationForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                // Refresh handled by socket events
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default DonationPage; 