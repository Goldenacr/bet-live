import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ArrowLeft, Clock, Activity, Goal, MessageSquare, Circle, Star, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://ciphertech-api.onrender.com';
const socket = io(API_URL);

// Formation coordinates (Percentages for CSS absolute positioning)
// 4-3-3 Formation
const HOME_FORMATION = [
  { top: '85%', left: '50%' }, // GK
  { top: '70%', left: '15%' }, { top: '75%', left: '35%' }, { top: '75%', left: '65%' }, { top: '70%', left: '85%' }, // DEF
  { top: '50%', left: '25%' }, { top: '55%', left: '50%' }, { top: '50%', left: '75%' }, // MID
  { top: '25%', left: '20%' }, { top: '20%', left: '50%' }, { top: '25%', left: '80%' } // ATT
];

// 4-2-3-1 Formation (Mirrored for Away)
const AWAY_FORMATION = [
  { top: '15%', left: '50%' }, // GK
  { top: '30%', left: '85%' }, { top: '25%', left: '65%' }, { top: '25%', left: '35%' }, { top: '30%', left: '15%' }, // DEF
  { top: '45%', left: '60%' }, { top: '45%', left: '40%' }, // DM
  { top: '65%', left: '80%' }, { top: '70%', left: '50%' }, { top: '65%', left: '20%' }, // AM
  { top: '85%', left: '50%' } // ST
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
  const [activeTab, setActiveTab] = useState('overview'); 

  const [betAmount, setBetAmount] = useState('');
  const [betPick, setBetPick] = useState('home');
  const [isPlacing, setIsPlacing] = useState(false);
  const [betMessage, setBetMessage] = useState('');

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
    });
    return () => socket.off(`match_update_${id}`);
  }, [id]);

  const handlePlaceBet = async () => {
    if (!user) return setBetMessage('Please login in Settings first.');
    if (!betAmount || isNaN(betAmount)) return setBetMessage('Enter a valid amount.');
    
    setIsPlacing(true);
    try {
      const res = await axios.post(`${API_URL}/api/bets/place`, { matchId: id, pick: betPick, amount: parseInt(betAmount), userJid: user.jid, isScore: false });
      if (res.data.success) {
        setBetMessage(`✅ Bet placed! ${res.data.bet.potentialWin} potential win.`);
        setBetAmount('');
      }
    } catch (err) {
      setBetMessage(`❌ ${err.response?.data?.message || 'Failed to place bet'}`);
    }
    setIsPlacing(false);
  };

  if (loading) return <div className="p-10 text-center text-white animate-pulse">Connecting to CipherTech Live...</div>;
  if (matchData?.error) return <div className="p-10 text-center text-white"><h2 className="text-2xl font-bold text-red-500 mb-4">Match Not Found</h2><button onClick={() => navigate('/')} className="bg-brand px-6 py-2 rounded-lg font-bold">Go Back Home</button></div>;

  // Safely get players or use dummy data if the match doesn't have players mapped yet
  const homePlayers = matchData.homePlayers?.length > 0 ? matchData.homePlayers : Array(11).fill('Home Player');
  const awayPlayers = matchData.awayPlayers?.length > 0 ? matchData.awayPlayers : Array(11).fill('Away Player');

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-bold"><ArrowLeft size={20} /> Back to Dashboard</button>

      {/* SCOREBOARD HEADER */}
      <div className="bg-card rounded-2xl border border-gray-700 p-6 mb-6 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        {minute > 0 && <div className="absolute top-4 left-4 text-red-500 font-bold flex items-center gap-2 animate-pulse bg-red-500/10 px-3 py-1 rounded-full"><div className="w-2 h-2 bg-red-500 rounded-full"></div> LIVE {minute}'</div>}
        <div className="text-center flex-1 mt-6 md:mt-0">
          <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full mb-2 flex items-center justify-center text-xl font-black">{matchData.home?.[0] || 'H'}</div>
          <div className="text-xl font-bold">{matchData.home}</div>
        </div>
        <div className="text-center px-8 my-4 md:my-0">
          <div className="text-5xl font-black tracking-tighter">{score.home} <span className="text-gray-600">:</span> {score.away}</div>
          <div className="text-sm text-gray-400 mt-2 font-bold">{matchData.id} | {matchData.league}</div>
        </div>
        <div className="text-center flex-1">
          <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full mb-2 flex items-center justify-center text-xl font-black">{matchData.away?.[0] || 'A'}</div>
          <div className="text-xl font-bold">{matchData.away}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
        {['overview', 'commentary', 'stats', 'bet'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-brand text-white' : 'text-gray-400 hover:bg-gray-800'}`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: THE FOOTBALL PITCH */}
        <div className={`lg:col-span-2 ${activeTab === 'overview' ? 'block' : 'hidden lg:block'}`}>
           <div className="bg-[#2e7d32] rounded-xl border-4 border-[#1b5e20] p-4 h-[500px] relative flex items-center justify-center overflow-hidden shadow-inner">
             
             {/* Pitch Lines */}
             <div className="absolute inset-4 border-2 border-white/30"></div>
             <div className="absolute top-4 bottom-4 left-1/2 w-0 border-l-2 border-white/30"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/30 rounded-full"></div>
             
             {/* Penalty Boxes */}
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-24 border-2 border-white/30 border-t-0"></div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-24 border-2 border-white/30 border-b-0"></div>
             
             {/* HOME PLAYERS */}
             {homePlayers.slice(0, 11).map((player, i) => (
                <div key={`home-${i}`} className="absolute flex flex-col items-center group cursor-pointer" style={HOME_FORMATION[i]}>
                  <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-md">
                    {player ? player[0] : 'H'}
                  </div>
                  <span className="text-[8px] text-white font-bold bg-black/50 px-1 rounded mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {player || 'Player'}
                  </span>
                </div>
             ))}

             {/* AWAY PLAYERS */}
             {awayPlayers.slice(0, 11).map((player, i) => (
                <div key={`away-${i}`} className="absolute flex flex-col items-center group cursor-pointer" style={AWAY_FORMATION[i]}>
                  <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-md">
                    {player ? player[0] : 'A'}
                  </div>
                  <span className="text-[8px] text-white font-bold bg-black/50 px-1 rounded mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {player || 'Player'}
                  </span>
                </div>
             ))}

             {/* ANIMATED BALL */}
             <div className="absolute animate-ping duration-1000">
                <Circle className="text-white fill-white shadow-lg" size={12} />
             </div>

           </div>
        </div>

        {/* RIGHT: SIDEBAR (Events, Stats, Betting) */}
        <div className="bg-card rounded-xl border border-gray-700 p-4 h-[500px] overflow-y-auto">
           <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-gray-700 pb-2 sticky top-0 bg-card z-10">
             {activeTab === 'stats' ? <Activity size={18}/> : activeTab === 'bet' ? <Goal size={18}/> : activeTab === 'commentary' ? <MessageSquare size={18}/> : <Clock size={18}/>} 
             {activeTab === 'stats' ? 'Match Stats' : activeTab === 'bet' ? 'Sportsbook' : activeTab === 'commentary' ? 'AI Commentator' : 'Live Events'}
           </h3>

           {/* OVERVIEW TAB */}
           {activeTab === 'overview' && (
             <div className="space-y-3">
                {events.length === 0 && <div className="text-gray-500 italic text-center mt-10">Waiting for kickoff...</div>}
                {events.slice().reverse().map((ev, idx) => (
                  <div key={idx} className="flex gap-3 bg-dark/50 p-3 rounded-lg border border-gray-700/50">
                    <div className="text-brand font-bold">{ev.minute}'</div>
                    <div>
                      <div className="font-bold text-sm text-white">{ev.type} {ev.type === 'GOAL' ? '⚽' : ev.type === 'CARD' ? '🟨' : '🚩'}</div>
                      <div className="text-xs text-gray-400">{ev.team === 'home' ? matchData.home : matchData.away}</div>
                    </div>
                  </div>
                ))}
             </div>
           )}

           {/* COMMENTARY TAB */}
           {activeTab === 'commentary' && (
             <div className="space-y-4">
               {commentary.length === 0 && <div className="text-gray-500 italic text-center mt-10">Commentator is warming up...</div>}
               {commentary.slice().reverse().map((c, idx) => (
                 <div key={idx} className="flex gap-3 bg-gray-800/50 p-3 rounded-lg border-l-2 border-brand">
                   <div className="text-brand font-bold text-xs mt-1">{c.minute}'</div>
                   <div className="text-sm text-gray-200 italic">"{c.text}"</div>
                 </div>
               ))}
             </div>
           )}

           {/* STATS TAB (Now includes Player of the Match) */}
           {activeTab === 'stats' && (
             <div className="space-y-6">
               {/* Player of the Match Card */}
               <div className="bg-dark p-3 rounded-lg border border-yellow-500/30 flex items-center gap-3">
                 <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                   <Star className="text-yellow-500" size={20}/>
                 </div>
                 <div>
                   <div className="text-xs text-gray-400">Player of the Match</div>
                   <div className="font-bold text-white">{homePlayers[9] || 'Top Striker'}</div>
                 </div>
                 <div className="ml-auto bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">8.5</div>
               </div>

               {[{ label: 'Possession', h: 55, a: 45 }, { label: 'Shots', h: 12, a: 8 }, { label: 'Corners', h: 6, a: 2 }].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span>{stat.h}</span><span className="text-gray-400">{stat.label}</span><span>{stat.a}</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-brand h-full" style={{ width: `${(stat.h / (stat.h + stat.a)) * 100}%` }}></div>
                      <div className="bg-blue-500 h-full" style={{ width: `${(stat.a / (stat.h + stat.a)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
             </div>
           )}

           {/* BET TAB */}
           {activeTab === 'bet' && (
            <div className="space-y-5">
              {matchData.status !== 'scheduled' ? (
                <div className="text-center text-red-400 font-bold mt-10">Betting is closed.</div>
              ) : (
                <>
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase">1X2 (Match Result)</div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setBetPick('home')} className={`p-2 rounded font-bold text-xs border ${betPick === 'home' ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>HOME<br/><span className="text-lg">2.0x</span></button>
                      <button onClick={() => setBetPick('draw')} className={`p-2 rounded font-bold text-xs border ${betPick === 'draw' ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>DRAW<br/><span className="text-lg">3.0x</span></button>
                      <button onClick={() => setBetPick('away')} className={`p-2 rounded font-bold text-xs border ${betPick === 'away' ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>AWAY<br/><span className="text-lg">2.5x</span></button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Both Teams to Score</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setBetPick('btts_yes')} className={`p-2 rounded font-bold text-xs border ${betPick === 'btts_yes' ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>YES<br/><span className="text-lg">1.8x</span></button>
                      <button onClick={() => setBetPick('btts_no')} className={`p-2 rounded font-bold text-xs border ${betPick === 'btts_no' ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>NO<br/><span className="text-lg">2.0x</span></button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">Amount (Coins)</label>
                    <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white font-bold" placeholder="e.g. 500"/>
                  </div>
                  <button onClick={handlePlaceBet} disabled={isPlacing} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-lg flex justify-center items-center gap-2">
                    {isPlacing ? 'Placing...' : 'Place Bet'}
                  </button>
                  {betMessage && <div className="text-center text-sm font-bold mt-2 text-gray-300">{betMessage}</div>}
                  {user && <div className="text-center text-xs text-gray-500 mt-2">Balance: {user.balance === 'unlimited' ? '∞' : user.balance} coins</div>}
                </>
              )}
            </div>
           )}
        </div>
      </div>
    </div>
  );
                    }
