import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, DollarSign, Wrench, PlayCircle, RefreshCw, Download, List } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Admin() {
  const { user } = useAuth();
  const [revenue, setRevenue] = useState(null);
  const [matches, setMatches] = useState([]);
  const [fixedMatches, setFixedMatches] = useState([]);
  const [fixId, setFixId] = useState('');
  const [fixScore, setFixScore] = useState('2-1');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (user?.role !== 'superowner') return;
    try {
      const revRes = await axios.get(`${API_URL}/api/admin/revenue`);
      setRevenue(revRes.data.data);

      const matchRes = await axios.get(`${API_URL}/matches`);
      const all = Object.values(matchRes.data.matches);
      
      // Upcoming/Live matches for Force Live & Fix
      const active = all.filter(m => m.status !== 'finished').sort((a, b) => a.status === 'scheduled' ? -1 : 1);
      setMatches(active);

      // Fixed matches list
      setFixedMatches(all.filter(m => m.fixed));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleFixMatch = async () => {
    if (!fixId) return alert("Enter a Match ID");
    setLoading(true);
    await axios.post(`${API_URL}/api/admin/fix`, { matchId: fixId, score: fixScore });
    alert('Match fixed successfully!');
    setFixId(''); fetchData(); setLoading(false);
  };

  const handleForceLive = async (matchId) => {
    if (!window.confirm(`Force ${matchId} LIVE?`)) return;
    await axios.post(`${API_URL}/api/admin/forcelive`, { matchId });
    alert(`Match ${matchId} is now LIVE!`);
    fetchData();
  };

  const handleRefresh = async () => {
    setLoading(true);
    await axios.post(`${API_URL}/api/admin/refresh`);
    alert('Season generated successfully!');
    fetchData(); setLoading(false);
  };

  const handleExport = async (type) => {
    alert(`Downloading ${type}.json...`);
    const res = await axios.get(`${API_URL}/api/admin/export/${type}`);
    // In a real app, this would trigger a file download. For now, we alert.
  };

  if (user?.role !== 'superowner') return <div className="p-10 text-center text-red-500 font-bold">Access Denied.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-purple-400 mb-8 flex items-center gap-2"><ShieldAlert /> Super Owner Dashboard</h1>

      {/* 1. Revenue */}
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

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button onClick={handleRefresh} disabled={loading} className="bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2"><RefreshCw className={loading ? "animate-spin" : ""}/> Refresh All Leagues</button>
        <button onClick={() => handleExport('matches')} className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2"><Download/> Export Matches</button>
        <button onClick={() => handleExport('bets')} className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2"><Download/> Export Bets</button>
      </div>

      {/* 3. Force Live & Fix Match */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-card p-6 rounded-xl border border-green-500/30">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400"><PlayCircle/> Force Match Live</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {matches.map(match => (
              <div key={match.id} className="bg-dark p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                <div><div className="font-bold text-sm text-white">{match.home} vs {match.away}</div><div className="text-xs text-gray-400">{match.id}</div></div>
                {match.status === 'scheduled' ? (
                  <button onClick={() => handleForceLive(match.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-bold text-xs">Go Live</button>
                ) : <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">● LIVE</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-red-500/30">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400"><Wrench/> Fix Match Score</h2>
          <div className="space-y-3">
            <input type="text" placeholder="Match ID (e.g. BETCH0001)" value={fixId} onChange={e=>setFixId(e.target.value)} className="w-full bg-dark border border-gray-700 rounded p-3 text-white"/>
            <input type="text" placeholder="Score (e.g. 2-1)" value={fixScore} onChange={e=>setFixScore(e.target.value)} className="w-full bg-dark border border-gray-700 rounded p-3 text-white"/>
            <button onClick={handleFixMatch} disabled={loading} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded">Apply Fix</button>
          </div>
        </div>
      </div>

      {/* 4. Fixed Matches List */}
      <div className="bg-card p-6 rounded-xl border border-yellow-500/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400"><List/> Currently Fixed Matches</h2>
        <div className="space-y-2">
          {fixedMatches.map(m => (
            <div key={m.id} className="bg-dark p-2 rounded flex justify-between text-sm">
              <span>{m.id}: {m.home} vs {m.away}</span>
              <span className="text-brand font-bold">{m.result?.home} - {m.result?.away}</span>
            </div>
          ))}
          {fixedMatches.length === 0 && <div className="text-gray-500 text-sm">No fixed matches active.</div>}
        </div>
      </div>

    </div>
  );
      }
