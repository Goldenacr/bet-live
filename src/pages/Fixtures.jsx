import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Hash, Trophy, CalendarDays, Star } from 'lucide-react';
import { useData } from '../context/DataContext';

// Priority helper function - lower number = higher priority
const getLeaguePriority = (league) => {
  if (!league) return 100;
  const l = league.toLowerCase();
  
  // 1. Top 5 European Leagues
  if (l.includes('premier league') && !l.includes('ghana') && !l.includes('npfl')) return 1;
  if (l.includes('la liga')) return 2;
  if (l.includes('serie a')) return 3;
  if (l.includes('bundesliga')) return 4;
  if (l.includes('ligue 1') && !l.includes('senegal') && !l.includes('algeria')) return 5;
  
  // 2. European Competitions
  if (l.includes('champions league') || l.includes('europa league')) return 6;
  
  // 3. Big Non-European Leagues
  if (l.includes('mls')) return 7;
  if (l.includes('saudi pro league')) return 8;
  if (l.includes('liga mx')) return 9;
  if (l.includes('eredivisie')) return 10;
  if (l.includes('primeira liga')) return 11;
  
  // 4. NBA
  if (l.includes('nba')) return 12;

  // 5. Cups & Mid-Tier Leagues
  if (l.includes('cup') || l.includes('trophy') || l.includes('shield')) return 15;
  if (l.includes('süper lig') || l.includes('turkish')) return 20;
  if (l.includes('scottish')) return 21;
  if (l.includes('belgian')) return 22;
  if (l.includes('argentine') || l.includes('brasileiro')) return 23;

  // 6. African & Asian Leagues
  if (l.includes('npfl') || l.includes('ghana')) return 30;
  if (l.includes('egyptian')) return 31;
  if (l.includes('j1 league') || l.includes('k league')) return 32;

  return 50; // Everything else
};

// Colored indicator based on priority
const getPriorityColor = (priority) => {
  if (priority <= 5) return 'bg-green-500';   // Top 5 leagues
  if (priority <= 11) return 'bg-blue-500';   // Big non-European
  if (priority <= 23) return 'bg-yellow-500'; // Mid tier
  return 'bg-gray-500';                        // Rest
};

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

    // Sort within each day by League Priority
    Object.keys(groups).forEach(label => {
      groups[label].sort((a, b) => {
        const priorityA = getLeaguePriority(a.league);
        const priorityB = getLeaguePriority(b.league);
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.kickoff - b.kickoff; // If same league, sort by time
      });
    });
    
    return groups;
  }, [matches]);

  if (loading && Object.keys(matches).length === 0) return <div className="p-10 text-center text-white animate-pulse">Loading Fixtures...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in pb-20">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-400">
        <Calendar size={24}/> Upcoming Fixtures
      </h1>
      
      {Object.keys(groupedMatches).length === 0 && (
        <div className="text-center text-gray-500 p-10 bg-card rounded-xl border border-gray-700">
          No upcoming matches scheduled.
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedMatches).map(([dateLabel, dateMatches]) => (
          <div key={dateLabel}>
            {/* Date Sticky Header */}
            <div className="flex items-center gap-2 mb-4 sticky top-16 md:top-4 z-10 bg-dark/90 py-2 backdrop-blur-sm">
              <CalendarDays size={18} className="text-brand"/>
              <h2 className="text-lg font-bold text-gray-200">{dateLabel}</h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{dateMatches.length} matches</span>
            </div>
            
            <div className="space-y-3">
              {dateMatches.map(match => {
                const priority = getLeaguePriority(match.league);
                return (
                  <div 
                    key={match.id} 
                    onClick={() => navigate(`/match/${match.id}`)} 
                    className="bg-card rounded-xl p-3 md:p-4 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all active:scale-95 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden"
                  >
                    {/* Priority Color Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityColor(priority)}`}></div>

                    {/* Match Info */}
                    <div className="flex flex-col w-full md:w-1/4 pl-2">
                      <div className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <Hash size={12}/> {match.id}
                      </div>
                      <div className="text-sm font-bold text-white mt-1 flex items-center gap-1">
                        {priority <= 5 && <Star size={12} className="text-yellow-500" />}
                        {match.league}
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="flex flex-1 items-center justify-center gap-4 w-full bg-dark/30 p-2 rounded-lg">
                      <div className="text-right flex-1 font-bold text-sm md:text-base text-white truncate">{match.home}</div>
                      <div className="text-gray-500 text-xs font-bold bg-dark px-2 py-1 rounded">VS</div>
                      <div className="text-left flex-1 font-bold text-sm md:text-base text-white truncate">{match.away}</div>
                    </div>

                    {/* Time & Cup */}
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
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
                      }
