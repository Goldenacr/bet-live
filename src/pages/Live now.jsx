import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Play, Activity } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function LiveNow() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get(`${API_URL}/matches`);
      const data = Object.values(res.data.matches).filter(m => m.status === 'live');
      setMatches(data);
    };
    fetchMatches();
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-red-500"><Activity size={24}/> Live Matches</h1>
      {matches.length === 0 ? (
        <div className="bg-card p-8 rounded-xl border border-gray-700 text-center text-gray-400">No matches are currently live.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map(match => (
            <div key={match.id} onClick={() => navigate(`/match/${match.id}`)} className="bg-card rounded-xl p-4 border border-red-500/50 cursor-pointer hover:border-brand transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded bg-red-500/20 text-red-400 animate-pulse">● LIVE</span>
                <span className="text-xs text-gray-400">{match.league}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-white">{match.home}</div>
                <div className="text-gray-500 text-sm">vs</div>
                <div className="font-bold text-white">{match.away}</div>
              </div>
              <button className="w-full bg-brand hover:bg-red-600 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Play size={16}/> Watch Live</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
