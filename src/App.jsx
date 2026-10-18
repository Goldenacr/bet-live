import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LiveMatch from './pages/LiveMatch';
import { Menu } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-dark text-white flex">
        {/* Sidebar with Hamburger toggle */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          {/* Top Mobile Header (Hamburger Button) */}
          <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-gray-800 sticky top-0 z-30">
            <div className="font-black text-brand">CIPHERTECH</div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-800 rounded-lg">
              <Menu size={24} />
            </button>
          </div>

          {/* Page Routing */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/match/:id" element={<LiveMatch />} />
              {/* Redirects for links in sidebar that aren't built yet */}
              <Route path="/live" element={<Navigate to="/" />} />
              <Route path="/fixtures" element={<Navigate to="/" />} />
              <Route path="/settings" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
