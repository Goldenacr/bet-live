import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Tournaments() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get(`${API_URL}/matches`);
      const data = Object.values(res.data.matches).filter(m => m.cupName);
      data.sort((a, b) => a.kickoff - b.kickoff);
      setMatches(data);
    };
    fetchMatches();
  }, []);

  const groupedCups = matches.reduce((acc, match) => {
    if (!acc[match.cupName]) acc[match.cupName] = [];
    acc[match.cupName].push(match);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-purple-400"><Award size={24}/> Tournaments & Cups</h1>
      <div className="space-y-8">
        {Object.entries(groupedCups).map(([cupName, cupMatches]) => (
          <div key={cupName} className="bg-card rounded-xl border border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">{cupName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cupMatches.map(match => (
                <div key={match.id} className="bg-dark rounded-lg p-3 border border-gray-800 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-purple-400 font-bold mb-1">{match.round || 'TBD'}</div>
                    <div className="font-bold text-sm">{match.home} vs {match.away}</div>
                  </div>
                  {match.status === 'live' ? (
                    <button onClick={() => navigate(`/match/${match.id}`)} className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-xs font-bold animate-pulse">WATCH LIVE</button>
                  ) : match.status === 'finished' ? (
                    <div className="text-brand font-black">{match.result?.home} - {match.result?.away}</div>
                  ) : (
                    <div className="text-xs text-gray-500">{new Date(match.kickoff).toLocaleDateString()}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedCups).length === 0 && <div className="text-gray-500 text-center p-10">No tournament matches found.</div>}
      </div>
    </div>
  );
}
