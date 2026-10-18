import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Shield, User } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Settings() {
  const { user, login, logout } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/login`, { phone });
      if (res.data.success) login(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your number.');
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center mt-20">
        <div className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-4"><User size={48} className="text-brand" /></div>
        <h1 className="text-3xl font-black mb-2">{user.name}</h1>
        <p className="text-gray-400 mb-6">ID: {user.id} • Role: {user.role}</p>
        <div className="bg-card border border-gray-700 rounded-xl p-6 mb-6">
          <h2 className="text-gray-400 font-bold mb-2">Current Balance</h2>
          <div className="text-5xl font-black text-green-400">{user.balance === 'unlimited' ? '∞' : user.balance.toLocaleString()} <span className="text-lg text-gray-500">coins</span></div>
        </div>
        {user.role === 'superowner' && (
          <a href="/admin" className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg mb-4">Go to Super Owner Admin Panel</a>
        )}
        <button onClick={logout} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-3 rounded-lg flex items-center justify-center gap-2"><LogOut size={18}/> Logout</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-20">
      <div className="text-center mb-8">
        <Shield size={48} className="text-brand mx-auto mb-4" />
        <h1 className="text-2xl font-black">Welcome to CipherTech</h1>
        <p className="text-gray-400">Login with your WhatsApp number to place bets.</p>
      </div>
      <form onSubmit={handleLogin} className="bg-card p-6 rounded-xl border border-gray-700">
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
        <label className="block text-sm font-bold text-gray-400 mb-2">WhatsApp Number</label>
        <input type="text" placeholder="e.g. 233557488116" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand mb-6"/>
        <button type="submit" disabled={loading} className="w-full bg-brand hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><LogIn size={18}/> {loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
                                                                                                                                     }
