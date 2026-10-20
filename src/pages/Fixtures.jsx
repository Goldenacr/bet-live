import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Hash, Trophy } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Fixtures() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get(`${API_URL}/matches`);
        // Filter only scheduled matches
        const data = Object.values(res.data.matches).filter(m => m.status === 'scheduled');
        // Sort by kickoff time (earliest first)
        data.sort((a, b) => a.kickoff - b.kickoff);
        setMatches(data);
      } catch (err) {
        console.error("Failed to fetch fixtures", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format time to local device timezone
  const formatTime = (timestamp) => {
    if (!timestamp) return 'TBD';
    const date = new Date(timestamp);
    
    // This uses the browser's default timezone (your phone's time)
    return date.toLocaleString('en-GB', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (loading) return <div className="p-10 text-center text-white animate-pulse">Loading Fixtures...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-400">
        <Calendar size={24}/> Upcoming Fixtures
      </h1>
      
      {matches.length === 0 ? (
        <div className="bg-card p-10 rounded-xl border border-gray-700 text-center text-gray-400">
          No upcoming fixtures available right now.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => (
            <div 
              key={match.id} 
              onClick={() => navigate(`/match/${match.id}`)} 
              className="bg-card rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all flex flex-col md:flex-row items-center justify-between gap-4"
            >
              {/* Left: Match ID & League */}
              <div className="w-full md:w-1/4">
                <div className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400 inline-block mb-2">UPCOMING</div>
                <div className="text-xs text-gray-400 flex items-center gap-1"><Hash size={12}/> {match.id}</div>
                <div className="text-sm font-bold text-white mt-1">{match.league}</div>
              </div>

              {/* Center: Teams */}
              <div className="flex flex-1 items-center justify-center gap-4 w-full">
                <div className="text-right flex-1 font-bold text-lg text-white">{match.home}</div>
                <div className="text-gray-500 text-sm bg-dark px-3 py-1 rounded-full">vs</div>
                <div className="text-left flex-1 font-bold text-lg text-white">{match.away}</div>
              </div>

              {/* Right: Time & Cup Info */}
              <div className="w-full md:w-1/4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm text-gray-300 mb-1 bg-dark/50 p-2 rounded">
                  <Clock size={14} className="text-brand" /> 
                  <span>{formatTime(match.kickoff)}</span>
                </div>
                {match.cupName && (
                  <div className="flex items-center justify-end gap-1 text-xs text-yellow-500">
                    <Trophy size={12}/> {match.cupName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
