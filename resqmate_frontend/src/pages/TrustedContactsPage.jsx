import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Topbar from '../components/Shared/Topbar.jsx';

const phoneSanitize = (v) => v.replace(/[^+\d]/g, '');
const isPhoneValid = (v) => /^\+?\d{8,15}$/.test(v);

const loadEntries = () => {
  try {
    const entries = JSON.parse(localStorage.getItem('trustedContactEntries') || '[]');
    if (Array.isArray(entries)) return entries;
  } catch {}
  try {
    const flat = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
    if (Array.isArray(flat)) return flat.map((p) => ({ name: '', phone: p }));
  } catch {}
  return [];
};

const saveEntries = (entries) => {
  const cleaned = entries.filter(e => e && e.phone);
  localStorage.setItem('trustedContactEntries', JSON.stringify(cleaned));
  // Keep flat list for PanicButton compatibility
  const flat = cleaned.map(e => e.phone);
  localStorage.setItem('trustedContacts', JSON.stringify(flat));
};

const TrustedContactsPage = () => {
  const [entries, setEntries] = useState(loadEntries());
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { saveEntries(entries); }, [entries]);

  const addContact = (e) => {
    e.preventDefault();
    setError('');
    const p = phoneSanitize(phone);
    if (!isPhoneValid(p)) {
      setError('Enter a valid phone number (include country code, e.g., +911234567890)');
      return;
    }
    if (entries.some(c => c.phone === p)) {
      setError('This phone number is already in your trusted contacts.');
      return;
    }
    setEntries([{ name: name.trim(), phone: p }, ...entries]);
    setName('');
    setPhone('');
  };

  const removeContact = (p) => {
    setEntries(entries.filter(c => c.phone !== p));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <Topbar title="Trusted Contacts" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-appear">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Trusted Contacts</h2>
              <p className="text-sm text-gray-600 mb-4">These contacts will be prefilled in your SMS when you trigger the Panic button on your phone.</p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <form onSubmit={addContact} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone (e.g., +911234567890)"
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 btn-soft">Add Contact</button>
              </form>

              <div className="divide-y divide-gray-100">
                {entries.length === 0 ? (
                  <div className="text-sm text-gray-500">No contacts added yet.</div>
                ) : entries.map((c) => (
                  <div key={c.phone} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-gray-900">{c.name || 'Unnamed contact'}</div>
                      <div className="text-sm text-gray-600">{c.phone}</div>
                    </div>
                    <button onClick={() => removeContact(c.phone)} className="px-3 py-2 text-red-600 rounded-lg hover:bg-red-50">Remove</button>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-xs text-gray-500">
                Tip: Ensure numbers include country code. On mobile, the Panic button opens the SMS app with these recipients and a map link to your location (if permitted).
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TrustedContactsPage;
