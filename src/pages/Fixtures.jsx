import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Hash, Trophy, CalendarDays } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Fixtures() {
  const { matches, loading } = useData();
  const navigate = useNavigate();

  const formatTime = (timestamp) => {
    if (!timestamp) return 'TBD';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedMatches = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrow = today + (24 * 60 * 60 * 1000);
    
    // Ensure we only show future/relevant matches
    const upcoming = Object.values(matches)
      .filter(m => m.status === 'scheduled' || m.status === 'upcoming' || m.status === 'live')
      .sort((a, b) => a.kickoff - b.kickoff);

    const groups = {};
    upcoming.forEach(match => {
      const matchDate = new Date(match.kickoff);
      const matchDay = new Date(matchDate.getFullYear(), matchDate.getMonth(), matchDate.getDate()).getTime();
      
      let label = '';
      if (matchDay === today) label = 'Today';
      else if (matchDay === tomorrow) label = 'Tomorrow';
      else label = matchDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

      if (!groups[label]) groups[label] = [];
      groups[label].push(match);
    });
    return groups;
  }, [matches]);

  if (loading && Object.keys(matches).length === 0) return <div className="p-10 text-center text-white animate-pulse">Loading Fixtures...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in pb-20">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-400"><Calendar size={24}/> Upcoming Fixtures</h1>
      
      {Object.keys(groupedMatches).length === 0 && (
         <div className="text-center text-gray-500 p-10 bg-card rounded-xl border border-gray-700">No upcoming matches scheduled.</div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedMatches).map(([dateLabel, dateMatches]) => (
          <div key={dateLabel}>
            <div className="flex items-center gap-2 mb-4 sticky top-16 md:top-4 z-10 bg-dark/90 py-2 backdrop-blur-sm">
              <CalendarDays size={18} className="text-brand"/>
              <h2 className="text-lg font-bold text-gray-200">{dateLabel}</h2>
            </div>
            
            <div className="space-y-3">
              {dateMatches.map(match => (
                <div key={match.id} onClick={() => navigate(`/match/${match.id}`)} className="bg-card rounded-xl p-3 md:p-4 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all active:scale-95 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  
                  <div className="flex flex-col w-full md:w-1/4">
                    <div className="text-xs font-bold text-gray-400 flex items-center gap-1"><Hash size={12}/> {match.id}</div>
                    <div className="text-sm font-bold text-white mt-1">{match.league}</div>
                  </div>

                  <div className="flex flex-1 items-center justify-center gap-4 w-full bg-dark/30 p-2 rounded-lg">
                    <div className="text-right flex-1 font-bold text-sm md:text-base text-white truncate">{match.home}</div>
                    <div className="text-gray-500 text-xs font-bold bg-dark px-2 py-1 rounded">VS</div>
                    <div className="text-left flex-1 font-bold text-sm md:text-base text-white truncate">{match.away}</div>
                  </div>

                  <div className="w-full md:w-1/4 text-right flex items-center md:flex-col justify-between md:justify-center gap-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">
                      <Clock size={14} /> {formatTime(match.kickoff)}
                    </div>
                    {match.cupName && (
                      <div className="flex items-center gap-1 text-xs text-yellow-500 font-bold">
                        <Trophy size={12}/> {match.cupName}
                      </div>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
        }
