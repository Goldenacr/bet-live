import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Activity, Calendar, Settings, Shield, X } from 'lucide-react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Live Now', path: '/live', icon: <Activity size={20} /> },
    { name: 'Fixtures', path: '/fixtures', icon: <Calendar size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 text-brand">
            <Shield size={28} />
            <span className="text-xl font-black text-white">CIPHERTECH</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => { if(window.innerWidth < 768) toggleSidebar(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-colors ${location.pathname === item.path ? 'bg-brand text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
          }
