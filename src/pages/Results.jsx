import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Trophy } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Results() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get(`${API_URL}/matches`);
      const data = Object.values(res.data.matches).filter(m => m.status === 'finished');
      data.sort((a, b) => b.kickoff - a.kickoff);
      setMatches(data);
    };
    fetchMatches();
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-gray-300"><CheckCircle size={24}/> Previous Results</h1>
      <div className="space-y-4">
        {matches.map(match => (
          <div key={match.id} className="bg-card rounded-xl p-4 border border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 w-48">
              {match.cupName ? <Trophy size={16} className="text-yellow-500"/> : <span className="w-4"></span>}
              <div className="text-xs font-bold text-gray-400">{match.cupName ? match.cupName : match.league}</div>
            </div>
            
            <div className="flex items-center justify-center gap-6 flex-1 w-full">
              <div className="text-right flex-1 font-bold text-white">{match.home}</div>
              <div className="bg-dark px-4 py-2 rounded-lg text-xl font-black text-brand">{match.result?.home || 0} - {match.result?.away || 0}</div>
              <div className="text-left flex-1 font-bold text-white">{match.away}</div>
            </div>
            
            <div className="text-xs text-gray-500 w-32 text-right">
              {new Date(match.kickoff).toLocaleDateString()} • {match.id}
            </div>
          </div>
        ))}
        {matches.length === 0 && <div className="text-center text-gray-500 p-10">No results available yet.</div>}
      </div>
    </div>
  );
}
