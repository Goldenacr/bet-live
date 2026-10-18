import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, DollarSign, Wrench } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Admin() {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState(null);
  const [fixId, setFixId] = useState('');
  const [fixScore, setFixScore] = useState('2-1');

  useEffect(() => {
    if (user?.role !== 'superowner') return;
    axios.get(`${API_URL}/api/admin/revenue`).then(res => setRevenue(res.data.data));
  }, [user]);

  const handleFixMatch = async () => {
    await axios.post(`${API_URL}/api/admin/fix`, { matchId: fixId, score: fixScore });
    alert('Match fixed successfully!');
    setFixId('');
  };

  if (user?.role !== 'superowner') {
    return <div className="p-10 text-center text-red-500 font-bold">Access Denied. Super Owners only.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-purple-400 mb-8 flex items-center gap-2"><ShieldAlert /> Super Owner Dashboard</h1>
      <div className="bg-card p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><DollarSign className="text-green-400"/> Revenue Stats</h2>
        {revenue ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark p-3 rounded"><div className="text-xs text-gray-400">Total Wagered</div><div className="text-xl font-bold">{revenue.total?.toLocaleString() || 0}</div></div>
            <div className="bg-dark p-3 rounded"><div className="text-xs text-gray-400">Football</div><div className="text-xl font-bold">{revenue.football?.toLocaleString() || 0}</div></div>
            <div className="bg-dark p-3 rounded"><div className="text-xs text-gray-400">Basketball</div><div className="text-xl font-bold">{revenue.basketball?.toLocaleString() || 0}</div></div>
            <div className="bg-dark p-3 rounded"><div className="text-xs text-gray-400">Total Bets</div><div className="text-xl font-bold">{revenue.totalBets || 0}</div></div>
          </div>
        ) : <div>Loading...</div>}
      </div>
      <div className="bg-card p-6 rounded-xl border border-red-500/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400"><Wrench/> Fix Match Result</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Match ID (e.g. BETCH0001)" value={fixId} onChange={e=>setFixId(e.target.value)} className="bg-dark border border-gray-700 rounded p-3 flex-1 text-white"/>
          <input type="text" placeholder="Score (e.g. 2-1)" value={fixScore} onChange={e=>setFixScore(e.target.value)} className="bg-dark border border-gray-700 rounded p-3 w-full md:w-32 text-white"/>
          <button onClick={handleFixMatch} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded">Apply Fix</button>
        </div>
      </div>
    </div>
  );
}
