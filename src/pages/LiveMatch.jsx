import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowLeft, Clock, Activity, Goal, MessageSquare, Circle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://ciphertech-api.onrender.com';
const socket = io(API_URL);

const HOME_FORMATION = [
  { top: '85%', left: '50%' }, { top: '70%', left: '15%' }, { top: '75%', left: '35%' }, { top: '75%', left: '65%' }, { top: '70%', left: '85%' },
  { top: '50%', left: '25%' }, { top: '55%', left: '50%' }, { top: '50%', left: '75%' },
  { top: '25%', left: '20%' }, { top: '20%', left: '50%' }, { top: '25%', left: '80%' }
];
const AWAY_FORMATION = [
  { top: '15%', left: '50%' }, { top: '30%', left: '85%' }, { top: '25%', left: '65%' }, { top: '25%', left: '35%' }, { top: '30%', left: '15%' },
  { top: '45%', left: '60%' }, { top: '45%', left: '40%' },
  { top: '65%', left: '80%' }, { top: '70%', left: '50%' }, { top: '65%', left: '20%' },
  { top: '85%', left: '50%' }
];

export default function LiveMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [minute, setMinute] = useState(0);
  const [events, setEvents] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [ballPos, setBallPos] = useState({ top: '50%', left: '50%' }); 
  const [activeTab, setActiveTab] = useState('overview'); 

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`${API_URL}/matches`);
        const match = res.data.matches[id];
        if (match) {
          setMatchData(match);
          if (match.result) setScore(match.result);
        } else {
          setMatchData({ error: true }); 
        }
      } catch (err) {
        setMatchData({ error: true });
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    socket.on(`match_update_${id}`, (data) => {
      setScore(data.score);
      setMinute(data.minute);
      setEvents(data.events || []);
      if (data.commentary) setCommentary(data.commentary);
      if (data.ballPos) setBallPos(data.ballPos);
    });
    return () => socket.off(`match_update_${id}`);
  }, [id]);

  if (loading) return <div className="p-10 text-center text-white animate-pulse">Connecting to Live Match...</div>;
  if (matchData?.error) return <div className="p-10 text-center text-white"><h2 className="text-2xl font-bold text-red-500 mb-4">Match Not Found</h2><button onClick={() => navigate('/')} className="bg-brand px-6 py-2 rounded-lg font-bold">Go Back Home</button></div>;

  const homePlayers = matchData.homePlayers?.length > 0 ? matchData.homePlayers : Array(11).fill('Home Player');
  const awayPlayers = matchData.awayPlayers?.length > 0 ? matchData.awayPlayers : Array(11).fill('Away Player');

  return (
    <div className="p-2 md:p-6 max-w-6xl mx-auto animate-fade-in">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 font-bold"><ArrowLeft size={20} /> Back</button>

      {/* SCOREBOARD */}
      <div className="bg-card rounded-2xl border border-gray-700 p-4 md:p-6 mb-6 flex flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        {minute > 0 && <div className="absolute top-2 left-2 text-xs text-red-500 font-bold flex items-center gap-1 animate-pulse bg-red-500/10 px-2 py-1 rounded-full"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> {minute}'</div>}
        
        <div className="text-center flex-1 mt-4 md:mt-0">
          <div className="w-10 h-10 md:w-16 md:h-16 mx-auto bg-gray-700 rounded-full mb-1 md:mb-2 flex items-center justify-center text-sm md:text-xl font-black">{matchData.home?.[0] || 'H'}</div>
          <div className="text-sm md:text-xl font-bold truncate">{matchData.home}</div>
        </div>
        
        <div className="text-center px-2 md:px-8">
          <div className="text-3xl md:text-5xl font-black tracking-tighter">{score.home} <span className="text-gray-600 text-xl md:text-3xl">:</span> {score.away}</div>
          <div className="text-[10px] md:text-sm text-gray-400 mt-1 font-bold">{matchData.id}</div>
        </div>
        
        <div className="text-center flex-1">
          <div className="w-10 h-10 md:w-16 md:h-16 mx-auto bg-gray-700 rounded-full mb-1 md:mb-2 flex items-center justify-center text-sm md:text-xl font-black">{matchData.away?.[0] || 'A'}</div>
          <div className="text-sm md:text-xl font-bold truncate">{matchData.away}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto hide-scrollbar">
        {['overview', 'commentary', 'stats'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-brand text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PITCH */}
        <div className={`lg:col-span-2 ${activeTab === 'overview' ? 'block' : 'hidden lg:block'}`}>
           <div className="bg-[#2e7d32] rounded-xl border-4 border-[#1b5e20] p-2 md:p-4 h-[300px] md:h-[500px] relative flex items-center justify-center overflow-hidden shadow-inner">
             
             <div className="absolute inset-2 md:inset-4 border-2 border-white/30"></div>
             <div className="absolute top-2 md:top-4 bottom-2 md:bottom-4 left-1/2 w-0 border-l-2 border-white/30"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-32 md:h-32 border-2 border-white/30 rounded-full"></div>
             <div className="absolute top-2 md:top-4 left-1/2 -translate-x-1/2 w-48 h-16 md:w-64 md:h-24 border-2 border-white/30 border-t-0"></div>
             <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-48 h-16 md:w-64 md:h-24 border-2 border-white/30 border-b-0"></div>
             
             {homePlayers.slice(0, 11).map((player, i) => (
                <div key={`home-${i}`} className="absolute flex flex-col items-center group cursor-pointer transition-all duration-1000 ease-in-out" style={HOME_FORMATION[i]}>
                  <div className="w-4 h-4 md:w-6 md:h-6 bg-red-600 rounded-full border border-white flex items-center justify-center text-[8px] md:text-[10px] font-bold shadow-md">
                    {player ? player[0] : 'H'}
                  </div>
                </div>
             ))}

             {awayPlayers.slice(0, 11).map((player, i) => (
                <div key={`away-${i}`} className="absolute flex flex-col items-center group cursor-pointer transition-all duration-1000 ease-in-out" style={AWAY_FORMATION[i]}>
                  <div className="w-4 h-4 md:w-6 md:h-6 bg-blue-600 rounded-full border border-white flex items-center justify-center text-[8px] md:text-[10px] font-bold shadow-md">
                    {player ? player[0] : 'A'}
                  </div>
                </div>
             ))}

             {minute > 0 && minute < 90 && (
               <div className="absolute transition-all duration-1000 ease-in-out z-20" style={{ top: ballPos.top, left: ballPos.left, transform: 'translate(-50%, -50%)' }}>
                 <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] border border-gray-300"></div>
               </div>
             )}

           </div>
        </div>

        {/* SIDEBAR */}
        <div className="bg-card rounded-xl border border-gray-700 p-4 h-[300px] md:h-[500px] overflow-y-auto">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-gray-700 pb-2 sticky top-0 bg-card z-10">
             {activeTab === 'stats' ? <Activity size={18}/> : activeTab === 'commentary' ? <MessageSquare size={18}/> : <Clock size={18}/>} 
             {activeTab === 'stats' ? 'Match Stats' : activeTab === 'commentary' ? 'AI Commentator' : 'Live Events'}
           </h3>

           {activeTab === 'overview' && (
             <div className="space-y-3">
                {events.length === 0 && <div className="text-gray-500 italic text-center mt-10">Waiting for kickoff...</div>}
                {events.slice().reverse().map((ev, idx) => (
                  <div key={idx} className="flex gap-3 bg-dark/50 p-3 rounded-lg border border-gray-700/50 animate-fade-in">
                    <div className="text-brand font-bold">{ev.minute}'</div>
                    <div>
                      <div className="font-bold text-sm text-white">{ev.type} {ev.type === 'GOAL' ? '⚽' : ev.type === 'CARD' ? '🟨' : '🚩'}</div>
                      <div className="text-xs text-gray-400">{ev.team === 'home' ? matchData.home : matchData.away}</div>
                    </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'commentary' && (
             <div className="space-y-4">
               {commentary.length === 0 && <div className="text-gray-500 italic text-center mt-10">Commentator is warming up...</div>}
               {commentary.slice().reverse().map((c, idx) => (
                 <div key={idx} className="flex gap-3 bg-gray-800/50 p-3 rounded-lg border-l-2 border-brand animate-fade-in">
                   <div className="text-brand font-bold text-xs mt-1">{c.minute}'</div>
                   <div className="text-sm text-gray-200 italic">"{c.text}"</div>
                 </div>
               ))}
             </div>
           )}

           {activeTab === 'stats' && (
             <div className="space-y-6">
               {[{ label: 'Possession', h: 55, a: 45 }, { label: 'Shots', h: 12, a: 8 }, { label: 'Corners', h: 6, a: 2 }].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-bold mb-1"><span>{stat.h}</span><span className="text-gray-400">{stat.label}</span><span>{stat.a}</span></div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-brand h-full" style={{ width: `${(stat.h / (stat.h + stat.a)) * 100}%` }}></div>
                      <div className="bg-blue-500 h-full" style={{ width: `${(stat.a / (stat.h + stat.a)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
    }
