import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LiveMatch from './pages/LiveMatch';
import LiveNow from './pages/LiveNow';
import Fixtures from './pages/Fixtures';
import Results from './pages/Results';
import Standings from './pages/Standings';
import Tournaments from './pages/Tournaments';
import MyBets from './pages/MyBets';
import Sportsbook from './pages/Sportsbook';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import { Menu } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-dark text-white flex">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-gray-800 sticky top-0 z-30">
            <div className="font-black text-brand">CIPHERTECH</div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-800 rounded-lg">
              <Menu size={24} />
            </button>
          </div>

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sportsbook" element={<Sportsbook />} />
              <Route path="/live" element={<LiveNow />} />
              <Route path="/fixtures" element={<Fixtures />} />
              <Route path="/results" element={<Results />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/mybets" element={<MyBets />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/match/:id" element={<LiveMatch />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
