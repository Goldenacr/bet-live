import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, PlayCircle, Wrench, Zap } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Admin() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [forceId, setForceId] = useState('');
  const [msg, setMsg] = useState('');

  // Fix State
  const [fixId, setFixId] = useState('');
  const [fixMarket, setFixMarket] = useState('home');

  const fetchMatches = async () => {
    const res = await axios.get(`${API_URL}/matches`);
    const active = Object.values(res.data.matches).filter(m => m.status !== 'finished').sort((a, b) => a.status === 'scheduled' ? -1 : 1);
    setMatches(active);
  };
  useEffect(() => { fetchMatches(); }, []);

  const handleForceLive = async (id) => {
    if (!id) return;
    await axios.post(`${API_URL}/api/admin/forcelive`, { matchId: id });
    setMsg(`✅ Match ${id} is now LIVE!`);
    setTimeout(() => setMsg(''), 3000);
    fetchMatches();
  };

  const handleFixMatch = async () => {
    if (!fixId) return setMsg('❌ Enter a Match ID');
    try {
      const res = await axios.post(`${API_URL}/api/admin/fix`, { matchId: fixId, market: fixMarket });
      setMsg(`✅ Fixed! Score set to ${res.data.score}`);
      fetchMatches();
    } catch (e) {
      setMsg('❌ Failed to fix match.');
    }
  };

  if (user?.role !== 'superowner') return <div className="p-10 text-center text-red-500 font-bold">Access Denied.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-purple-400 mb-8 flex items-center gap-2"><ShieldAlert /> Super Owner Dashboard</h1>
      {msg && <div className="bg-dark p-3 rounded mb-4 font-bold text-center text-brand border border-brand/50">{msg}</div>}

      {/* FORCE LIVE */}
      <div className="bg-card p-6 rounded-xl border border-green-500/30 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400"><PlayCircle/> Force Any Match Live</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Match ID (e.g. BETCH0001)" value={forceId} onChange={e=>setForceId(e.target.value)} className="bg-dark border border-gray-700 rounded p-3 flex-1 text-white"/>
          <button onClick={() => handleForceLive(forceId)} className="bg-green-600 text-white font-bold px-6 rounded">Go Live</button>
        </div>
      </div>

      {/* FIX SPECIFIC MARKET */}
      <div className="bg-card p-6 rounded-xl border border-red-500/30 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400"><Wrench/> Fix Specific Bet Market</h2>
        <p className="text-xs text-gray-400 mb-4">Select a market and the API will generate a score that guarantees that market wins (e.g., selecting Over 2.5 will set the score to 2-1).</p>
        
        <div className="flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Match ID (e.g. BETCH0001)" value={fixId} onChange={e=>setFixId(e.target.value)} className="bg-dark border border-gray-700 rounded p-3 flex-1 text-white"/>
          
          <select value={fixMarket} onChange={e=>setFixMarket(e.target.value)} className="bg-dark border border-gray-700 rounded p-3 flex-1 text-white">
            <optgroup label="1X2">
              <option value="home">Home Win</option>
              <option value="draw">Draw</option>
              <option value="away">Away Win</option>
            </optgroup>
            <optgroup label="Goals">
              <option value="over_0.5">Over 0.5</option>
              <option value="over_1.5">Over 1.5</option>
              <option value="over_2.5">Over 2.5</option>
              <option value="over_3.5">Over 3.5</option>
              <option value="over_4.5">Over 4.5</option>
              <option value="under_0.5">Under 0.5</option>
              <option value="under_1.5">Under 1.5</option>
              <option value="under_2.5">Under 2.5</option>
              <option value="under_3.5">Under 3.5</option>
              <option value="under_4.5">Under 4.5</option>
            </optgroup>
            <optgroup label="BTTS">
              <option value="btts_yes">BTTS Yes</option>
              <option value="btts_no">BTTS No</option>
            </optgroup>
            <optgroup label="Halves & 10 Min">
              <option value="ht_home">HT Home</option>
              <option value="ht_draw">HT Draw</option>
              <option value="ht_away">HT Away</option>
              <option value="first10_home">10m Home</option>
              <option value="first10_draw">10m Draw</option>
              <option value="first10_away">10m Away</option>
            </optgroup>
            <optgroup label="Handicap">
              <option value="handicap_home_-1">Home -1</option>
              <option value="handicap_home_-2">Home -2</option>
              <option value="handicap_away_-1">Away -1</option>
              <option value="handicap_away_-2">Away -2</option>
            </optgroup>
            <optgroup label="Correct Score">
              <option value="score_0-0">0-0</option>
              <option value="score_1-0">1-0</option>
              <option value="score_1-1">1-1</option>
              <option value="score_2-0">2-0</option>
              <option value="score_2-1">2-1</option>
              <option value="score_2-2">2-2</option>
              <option value="score_3-0">3-0</option>
              <option value="score_3-1">3-1</option>
              <option value="score_3-2">3-2</option>
            </optgroup>
          </select>

          <button onClick={handleFixMatch} className="bg-red-500 text-white font-bold px-6 rounded">Apply Fix</button>
        </div>
      </div>

      {/* QUICK ACTIONS LIST */}
      <div className="bg-card p-6 rounded-xl border border-gray-700">
        <h2 className="text-lg font-bold mb-4 text-gray-300">Active Matches</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {matches.map(m => (
            <div key={m.id} className="flex justify-between items-center bg-dark p-3 rounded border border-gray-700 text-sm">
              <span>{m.id} - {m.home} vs {m.away} ({m.status})</span>
              <button onClick={() => handleForceLive(m.id)} className="bg-brand text-white px-3 py-1 rounded text-xs font-bold">Live</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
                                                              }
