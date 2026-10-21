import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Hash, Trophy } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Fixtures() {
  const { matches, loading } = useData();
  const navigate = useNavigate();

  const formatTime = (timestamp) => {
    if (!timestamp) return 'TBD';
    return new Date(timestamp).toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading && Object.keys(matches).length === 0) return <div className="p-10 text-center text-white animate-pulse">Loading Fixtures...</div>;

  const upcoming = Object.values(matches)
    .filter(m => m.status === 'scheduled' || m.status === 'upcoming')
    .sort((a, b) => a.kickoff - b.kickoff);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-blue-400"><Calendar size={24}/> Upcoming Fixtures</h1>
      <div className="space-y-4">
        {upcoming.map(match => (
          <div key={match.id} onClick={() => navigate(`/match/${match.id}`)} className="bg-card rounded-xl p-4 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all active:scale-95 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-1/4">
              <div className="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-400 inline-block mb-2">UPCOMING</div>
              <div className="text-xs text-gray-400 flex items-center gap-1"><Hash size={12}/> {match.id}</div>
              <div className="text-sm font-bold text-white mt-1">{match.league}</div>
            </div>
            <div className="flex flex-1 items-center justify-center gap-4 w-full">
              <div className="text-right flex-1 font-bold text-lg text-white truncate">{match.home}</div>
              <div className="text-gray-500 text-sm bg-dark px-3 py-1 rounded-full">vs</div>
              <div className="text-left flex-1 font-bold text-lg text-white truncate">{match.away}</div>
            </div>
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
    </div>
  );
}
