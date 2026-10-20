import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, Shield, User, Lock, Settings as SettingsIcon, Bell, DollarSign, Globe, Palette, ShieldAlert, Search } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Settings() {
  const { user, login, logout } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- PLAYER SETTINGS STATE ---
  const [notifications, setNotifications] = useState(true);
  const [oddsFormat, setOddsFormat] = useState('decimal');
  const [themeColor, setThemeColor] = useState('red');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // --- ADMIN TOOLS STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [foundPlayer, setFoundPlayer] = useState(null);
  const [adminCoinAmount, setAdminCoinAmount] = useState('');
  const [adminAction, setAdminAction] = useState('add'); // 'add' or 'deduct'
  const [adminPass, setAdminPass] = useState('');
  const [adminMsg, setAdminMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/login`, { phone, password });
      if (res.data.success) login(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword) return setPassMsg('Enter a new password');
    try {
      await axios.post(`${API_URL}/api/admin/setpassword`, { targetJid: user.jid, newPassword });
      setPassMsg('✅ Password updated! Next login will require it.');
      setNewPassword('');
    } catch (e) { setPassMsg('❌ Failed to update password.'); }
  };

  const handleAdminSearch = async () => {
    setAdminMsg('');
    try {
      // Simple search by checking login endpoint
      const res = await axios.post(`${API_URL}/api/login`, { phone: searchQuery });
      if (res.data.success) {
        setFoundPlayer(res.data.user);
      }
    } catch (e) {
      setAdminMsg('❌ Player not found.');
      setFoundPlayer(null);
    }
  };

  const handleAdminBalance = async () => {
    if (!foundPlayer || !adminCoinAmount) return;
    const amt = parseInt(adminCoinAmount);
    const finalAmt = adminAction === 'add' ? amt : -amt;
    
    try {
      await axios.post(`${API_URL}/api/admin/balance`, { targetJid: foundPlayer.jid, amount: finalAmt });
      setAdminMsg(`✅ ${adminAction === 'add' ? 'Added' : 'Deducted'} ${amt} coins.`);
      setFoundPlayer(prev => ({ ...prev, balance: prev.balance + finalAmt }));
      setAdminCoinAmount('');
    } catch (e) { setAdminMsg('❌ Failed to adjust balance.'); }
  };

  const handleAdminPassword = async () => {
    if (!foundPlayer || !adminPass) return;
    try {
      await axios.post(`${API_URL}/api/admin/setpassword`, { targetJid: foundPlayer.jid, newPassword: adminPass });
      setAdminMsg(`✅ Password set for ${foundPlayer.name}.`);
      setAdminPass('');
    } catch (e) { setAdminMsg('❌ Failed to set password.'); }
  };

  // ================= RENDER =================
  
  if (!user) {
    return (
      <div className="p-6 max-w-md mx-auto mt-20">
        <div className="text-center mb-8">
          <Shield size={48} className="text-brand mx-auto mb-4" />
          <h1 className="text-2xl font-black">Login to CipherTech</h1>
        </div>
        <form onSubmit={handleLogin} className="bg-card p-6 rounded-xl border border-gray-700">
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
          <label className="block text-sm font-bold text-gray-400 mb-2">WhatsApp Number</label>
          <input type="text" placeholder="e.g. 233557488116" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand mb-4"/>
          <label className="block text-sm font-bold text-gray-400 mb-2">Password (Optional)</label>
          <input type="password" placeholder="Leave blank if no password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-brand mb-6"/>
          <button type="submit" disabled={loading} className="w-full bg-brand hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><LogIn size={18}/> {loading ? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* HEADER PROFILE */}
      <div className="bg-card border border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${themeColor === 'red' ? 'bg-red-500/20 text-red-500' : themeColor === 'blue' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
          <User size={40} />
        </div>
        <h1 className="text-2xl font-black">{user.name}</h1>
        <p className="text-gray-400 mb-2">ID: {user.id} • Role: {user.role === 'superowner' ? 'Super Owner' : 'Player'}</p>
        <div className="text-4xl font-black text-green-400 mb-6">{user.balance === 'unlimited' ? '∞' : user.balance.toLocaleString()} <span className="text-sm text-gray-500">coins</span></div>
        <button onClick={logout} className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-lg flex items-center justify-center gap-2"><LogOut size={18}/> Logout</button>
      </div>

      {/* PLAYER PREFERENCES */}
      <div className="bg-card border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><SettingsIcon size={20}/> Preferences</h2>
        
        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2"><Bell size={16} className="text-gray-400"/> <span className="text-sm font-bold">Bet & Match Notifications</span></div>
            <button onClick={() => setNotifications(!notifications)} className={`w-10 h-6 rounded-full relative transition-colors ${notifications ? 'bg-brand' : 'bg-gray-700'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>

          {/* Odds Format */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2"><DollarSign size={16} className="text-gray-400"/> <span className="text-sm font-bold">Odds Format</span></div>
            <select value={oddsFormat} onChange={(e) => setOddsFormat(e.target.value)} className="bg-dark border border-gray-700 rounded p-1 text-sm text-white">
              <option value="decimal">Decimal (2.0x)</option>
              <option value="fractional">Fractional (1/1)</option>
            </select>
          </div>

          {/* Theme Color */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2"><Palette size={16} className="text-gray-400"/> <span className="text-sm font-bold">App Theme</span></div>
            <div className="flex gap-2">
              <button onClick={() => setThemeColor('red')} className={`w-6 h-6 rounded-full bg-red-500 border-2 ${themeColor === 'red' ? 'border-white' : 'border-transparent'}`}></button>
              <button onClick={() => setThemeColor('blue')} className={`w-6 h-6 rounded-full bg-blue-500 border-2 ${themeColor === 'blue' ? 'border-white' : 'border-transparent'}`}></button>
              <button onClick={() => setThemeColor('green')} className={`w-6 h-6 rounded-full bg-green-500 border-2 ${themeColor === 'green' ? 'border-white' : 'border-transparent'}`}></button>
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Globe size={16} className="text-gray-400"/> <span className="text-sm font-bold">Language</span></div>
            <select className="bg-dark border border-gray-700 rounded p-1 text-sm text-white">
              <option>English</option>
              <option>Français</option>
              <option>Kiswahili</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECURITY (CHANGE PASSWORD) */}
      <div className="bg-card border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Lock size={20}/> Security</h2>
        {passMsg && <div className="bg-dark p-2 text-center text-sm font-bold text-brand rounded mb-3">{passMsg}</div>}
        <p className="text-xs text-gray-400 mb-3">Set a web password to protect your account. If left empty, you log in with just your number.</p>
        <div className="flex gap-2">
          <input type="password" placeholder="New Web Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="flex-1 bg-dark border border-gray-700 rounded p-3 text-white"/>
          <button onClick={handleChangePassword} className="bg-brand text-white font-bold px-4 rounded">Save</button>
        </div>
      </div>

      {/* SUPER OWNER ADMIN PANEL */}
      {user.role === 'superowner' && (
        <div className="bg-card border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400"><ShieldAlert size={20}/> Admin: User Control</h2>
          
          {adminMsg && <div className="bg-dark p-2 text-center text-sm font-bold text-purple-400 rounded mb-3">{adminMsg}</div>}

          {/* SEARCH USER */}
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="Search player by phone (e.g. 23355...)" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-dark border border-gray-700 rounded p-3 text-white"/>
            <button onClick={handleAdminSearch} className="bg-purple-600 text-white font-bold px-4 rounded flex items-center gap-2"><Search size={16}/> Find</button>
          </div>

          {/* FOUND USER PROFILE & ACTIONS */}
          {foundPlayer && (
            <div className="bg-dark p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-800">
                <div>
                  <div className="font-bold text-white">{foundPlayer.name}</div>
                  <div className="text-xs text-gray-400">ID: {foundPlayer.id} • Role: {foundPlayer.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Balance</div>
                  <div className="font-black text-green-400">{foundPlayer.balance === 'unlimited' ? '∞' : foundPlayer.balance.toLocaleString()}</div>
                </div>
              </div>

              {/* Adjust Balance */}
              <div className="flex gap-2 mb-3">
                <select value={adminAction} onChange={e => setAdminAction(e.target.value)} className="bg-card border border-gray-700 rounded p-2 text-sm text-white">
                  <option value="add">Add Coins</option>
                  <option value="deduct">Deduct Coins</option>
                </select>
                <input type="number" placeholder="Amount" value={adminCoinAmount} onChange={e => setAdminCoinAmount(e.target.value)} className="flex-1 bg-card border border-gray-700 rounded p-2 text-white"/>
                <button onClick={handleAdminBalance} className="bg-green-600 text-white font-bold px-4 rounded text-sm">Apply</button>
              </div>

              {/* Set Password */}
              <div className="flex gap-2">
                <input type="text" placeholder="Assign Web Password" value={adminPass} onChange={e => setAdminPass(e.target.value)} className="flex-1 bg-card border border-gray-700 rounded p-2 text-white"/>
                <button onClick={handleAdminPassword} className="bg-brand text-white font-bold px-4 rounded text-sm">Set Pass</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
    }
