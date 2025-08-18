import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../utils/auth';
import img1 from '../assets/publicContain.jpg'
import img2 from '../assets/publicContain.png';
const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goProfile = () => {
    if (isAuthenticated()) navigate('/dashboard');
    else navigate('/register');
  };
  const goRegister = () => navigate('/register');
  const goLogin = () => navigate('/login');
  const handleLogout = () => { logout(); navigate('/login'); };
  const goSOS = () => navigate('/sos');
  const goDonations = () => navigate('/donations');
  const goVolunteer = () => navigate('/volunteer-hub');

  return (
    <div className="bg-gray-100 font-sans leading-normal text-gray-900">
      {/* Navbar */}
      <nav className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 text-2xl font-bold">ResQMate</span>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-700">
              <button onClick={goSOS} className="hover:text-red-600">SOS Alerts</button>
              <button onClick={goDonations} className="hover:text-red-600">Donations</button>
              <button onClick={goVolunteer} className="hover:text-red-600">Volunteer</button>
              <button onClick={goProfile} className="hover:text-red-600">User Profile</button>
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {!isAuthenticated() ? (
                <>
                  <button onClick={goLogin} className="px-4 py-2 text-gray-700 hover:text-red-600">Login</button>
                  <button onClick={goRegister} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Register</button>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-gray-700 hover:text-red-600">Dashboard</button>
                  <button onClick={handleLogout} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">Logout</button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center px-3 py-2 rounded-md text-gray-600 hover:text-red-600 focus:outline-none"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={!mobileOpen ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-6 py-4 space-y-2 text-gray-700">
              <button onClick={() => { setMobileOpen(false); goSOS(); }} className="block w-full text-left hover:text-red-600">SOS Alerts</button>
              <button onClick={() => { setMobileOpen(false); goDonations(); }} className="block w-full text-left hover:text-red-600">Donations</button>
              <button onClick={() => { setMobileOpen(false); goVolunteer(); }} className="block w-full text-left hover:text-red-600">Volunteer</button>
              <button onClick={() => { setMobileOpen(false); goProfile(); }} className="block w-full text-left hover:text-red-600">User Profile</button>
              <div className="pt-2 flex items-center space-x-3">
                {!isAuthenticated() ? (
                  <>
                    <button onClick={() => { setMobileOpen(false); goLogin(); }} className="px-3 py-2 text-gray-700 hover:text-red-600">Login</button>
                    <button onClick={() => { setMobileOpen(false); goRegister(); }} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Register</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setMobileOpen(false); navigate('/dashboard'); }} className="px-3 py-2 text-gray-700 hover:text-red-600">Dashboard</button>
                    <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Logout</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-semibold text-yellow-600 uppercase tracking-widest mb-3">Real-Time Emergency Response</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">Connect. Respond. Save Lives.</h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600">
                ResQMate transforms disaster response through real-time SOS alerts, volunteer coordination, and donation management. Join a community that saves lives when every second counts.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={goProfile} className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 btn-soft">User Profile</button>
                <button onClick={goSOS} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 btn-soft">Emergency SOS</button>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">24/7</h3>
                  <p className="text-gray-600 text-sm">Emergency Response</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Real-Time</h3>
                  <p className="text-gray-600 text-sm">Alerts & Updates</p>
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Global</h3>
                  <p className="text-gray-600 text-sm">Volunteer Network</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img src={img1} alt="Volunteers using ResQMate app" className="w-full max-w-md md:max-w-none rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16 lg:py-20">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-widest mb-2">Platform Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Everything You Need for Emergency Response</h2>
          <p className="text-gray-600 max-w-2xl">From instant SOS alerts to volunteer coordination and donation management, ResQMate provides comprehensive tools for effective disaster response.</p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left shadow-sm card-soft card-appear">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-Time SOS Alerts</h3>
              <p className="text-gray-600 text-sm">Send instant emergency alerts with geolocation, images, and detailed descriptions. Every second counts in emergencies.</p>
              <button onClick={goSOS} className="text-red-600 mt-4 font-semibold hover:underline">Create Alert →</button>
            </div>
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left shadow-sm card-soft card-appear">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Volunteer Network</h3>
              <p className="text-gray-600 text-sm">Connect with trained volunteers and emergency responders. Efficient assignment system ensures rapid response.</p>
              <button onClick={goVolunteer} className="text-red-600 mt-4 font-semibold hover:underline">Join Network →</button>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left shadow-sm card-soft card-appear">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Donations</h3>
              <p className="text-gray-600 text-sm">Coordinate resource donations with intelligent matching and pickup logistics. Track every contribution.</p>
              <button onClick={goDonations} className="text-red-600 mt-4 font-semibold hover:underline">Make Donation →</button>
            </div>
            {/* Feature 4 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left shadow-sm card-soft card-appear">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Live Updates</h3>
              <p className="text-gray-600 text-sm">Stay informed with instant notifications and real-time status updates on all emergencies.</p>
              <button onClick={goProfile} className="text-red-600 mt-4 font-semibold hover:underline">View Updates →</button>
            </div>
            {/* Feature 5 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left shadow-sm card-soft card-appear">
              <h3 className="text-lg font-bold text-gray-900 mb-2">GPS Integration</h3>
              <p className="text-gray-600 text-sm">Precise geolocation tracking ensures help reaches the right place at the right time.</p>
            </div>
            {/* Feature 6 */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-left shadow-sm card-soft card-appear">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600 text-sm">Track response times, volunteer activity, and donation impact with comprehensive analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join section */}
      <section className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Join a Global Network of Heroes</h2>
              <p className="text-gray-600">ResQMate connects everyday heroes with those in need. Our platform empowers volunteers, first responders, and community members to make a real difference when disasters strike.</p>
              <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">5K+</h3>
                  <p className="text-gray-600 text-sm">Active Volunteers</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">50+</h3>
                  <p className="text-gray-600 text-sm">Cities Covered</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">24/7</h3>
                  <p className="text-gray-600 text-sm">Response Time</p>
                </div>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={goVolunteer} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 btn-soft">Become a Volunteer</button>
                <button onClick={goDonations} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 btn-soft">Make Donation</button>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <img src={img2} alt="ResQMate volunteers" className="w-full max-w-md md:max-w-none rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16 lg:py-20 text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">Every Second Counts. <br className="hidden sm:block" /> Be Ready When It Matters Most.</h2>
          <p className="text-base sm:text-lg max-w-2xl text-red-50">Join thousands of heroes making a difference. ResQMate gives you the power to save lives, coordinate resources, and respond fast.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button onClick={goRegister} className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 btn-soft">Join ResQMate Now</button>
            <button onClick={goSOS} className="px-6 py-3 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 btn-soft">Emergency SOS</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="text-white text-2xl font-bold mb-3">ResQMate</div>
              <p className="text-sm text-gray-400">ResQMate transforms disaster response through real-time emergency coordination, connecting heroes with those in need when every second counts.</p>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/')} className="hover:text-white">Home</button></li>
                <li><button onClick={goSOS} className="hover:text-white">SOS Alerts</button></li>
                <li><button onClick={goDonations} className="hover:text-white">Donations</button></li>
                <li><button onClick={goProfile} className="hover:text-white">Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-3">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={goLogin} className="hover:text-white">Login</button></li>
                <li><button onClick={goRegister} className="hover:text-white">Register</button></li>
                <li><button onClick={goProfile} className="hover:text-white">User Profile</button></li>
                <li><button onClick={goVolunteer} className="hover:text-white">Assign Volunteers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-3">Get the App</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-gray-400">App Store (coming soon)</span></li>
                <li><span className="text-gray-400">Google Play (coming soon)</span></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-gray-800 text-center text-xs text-gray-500">© 2025 ResQMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
