import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Calendar, Activity, Loader } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const { matches, loading } = useData();
  const navigate = useNavigate();

  if (loading && Object.keys(matches).length === 0) return <div className="p-10 text-center text-white animate-pulse">Loading Dashboard...</div>;

  const allMatches = Object.values(matches);
  const liveMatches = allMatches.filter(m => m.status === 'live');
  const upcomingMatches = allMatches.filter(m => m.status === 'scheduled' || m.status === 'upcoming');

  const MatchCard = ({ match }) => (
    <div onClick={() => navigate(`/match/${match.id}`)} className="bg-card rounded-xl p-4 border border-gray-700 hover:border-brand cursor-pointer transition-all active:scale-95">
      <div className="flex justify-between items-center mb-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${match.status === 'live' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-500/20 text-blue-400'}`}>
          {match.status === 'live' ? '● LIVE' : 'UPCOMING'}
        </span>
        <span className="text-xs text-gray-400">{match.league}</span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-bold text-white truncate w-2/5 text-right pr-2">{match.home}</div>
        <div className="text-gray-500 text-sm w-1/5 text-center">vs</div>
        <div className="font-bold text-white truncate w-2/5 text-left pl-2">{match.away}</div>
      </div>
      <button className="w-full bg-gray-800 hover:bg-brand text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2">
        {match.status === 'live' ? <><Play size={16}/> Watch Live</> : <><Calendar size={16}/> View Match</>}
      </button>
    </div>
  );

  return (
    <div className="p-6 animate-fade-in">
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
          {upcomingMatches.slice(0, 15).map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
    </div>
  );
}
