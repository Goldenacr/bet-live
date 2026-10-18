import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, Activity } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get(`${API_URL}/matches`);
      const data = Object.values(res.data.matches).filter(m => m.status === 'live' || m.status === 'scheduled');
      setMatches(data);
    };
    fetchMatches();
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'scheduled');

  const MatchCard = ({ match }) => (
    <div onClick={() => navigate(`/match/${match.id}`)} className="bg-card rounded-xl p-4 border border-gray-700 hover:border-brand cursor-pointer transition-all">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${match.status === 'live' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'}`}>
          {match.status === 'live' ? '● LIVE' : 'UPCOMING'}
        </span>
        <span className="text-xs text-gray-400">{match.league}</span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-white">{match.home}</div>
        <div className="text-gray-500 text-sm">vs</div>
        <div className="font-bold text-white">{match.away}</div>
      </div>
      <button className="w-full bg-gray-800 hover:bg-brand text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2">
        {match.status === 'live' ? <><Play size={16}/> Watch Live</> : <><Calendar size={16}/> View Match</>}
      </button>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6">Match Center</h1>
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2"><Activity size={20}/> Live Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2"><Calendar size={20}/> Upcoming Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
    </div>
  );
}
