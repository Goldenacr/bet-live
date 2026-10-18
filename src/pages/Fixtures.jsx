import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Fixtures() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get(`${API_URL}/matches`);
      const data = Object.values(res.data.matches).filter(m => m.status === 'scheduled');
      data.sort((a, b) => a.kickoff - b.kickoff);
      setMatches(data);
    };
    fetchMatches();
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + ' (GMT)';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-400"><Calendar size={24}/> Upcoming Fixtures</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map(match => (
          <div key={match.id} onClick={() => navigate(`/match/${match.id}`)} className="bg-card rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400">UPCOMING</span>
              <span className="text-xs text-gray-400">{match.league}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold text-white">{match.home}</div>
              <div className="text-gray-500 text-sm">vs</div>
              <div className="font-bold text-white">{match.away}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 bg-dark/50 p-2 rounded">
              <Clock size={14} className="text-brand" /> {formatTime(match.kickoff)}
            </div>
            <button className="w-full bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold py-2 rounded-lg">View Preview</button>
          </div>
        ))}
      </div>
    </div>
  );
                                         }
