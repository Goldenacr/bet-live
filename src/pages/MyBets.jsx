import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ticket, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function MyBets() {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('single'); // 'single' or 'multiple'
  const [expandedId, setExpandedId] = useState(null); // To open/close details

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    
    const fetchBets = async () => {
      try {
        const res = await axios.get(`${API_URL}/bets`);
        const myBets = Object.values(res.data.bets)
          .filter(b => b.user === user.jid)
          .sort((a,b) => b.placedAt - a.placedAt);
        setBets(myBets);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    
    fetchBets();
    const interval = setInterval(fetchBets, 10000); 
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return <div className="p-10 text-center text-gray-400">Please login in Settings to view your bets.</div>;
  if (loading) return <div className="p-10 text-center text-white animate-pulse">Loading your bets...</div>;

  const singles = bets.filter(b => b.type !== 'accumulator');
  const multiples = bets.filter(b => b.type === 'accumulator');
  const displayBets = tab === 'single' ? singles : multiples;

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2"><Ticket /> My Bet History</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        <button onClick={() => setTab('single')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab === 'single' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Singles ({singles.length})</button>
        <button onClick={() => setTab('multiple')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${tab === 'multiple' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-gray-800'}`}>Multiple ({multiples.length})</button>
      </div>
      
      <div className="space-y-3">
        {displayBets.map(bet => {
          const isExpanded = expandedId === bet.id;
          return (
            <div key={bet.id} className="bg-card rounded-xl border border-gray-700 overflow-hidden transition-all">
              
              {/* Card Header (Always visible) */}
              <div onClick={() => toggleExpand(bet.id)} className="p-4 flex justify-between items-center cursor-pointer hover:bg-dark/30">
                <div>
                  <div className="font-bold text-white flex items-center gap-2 mb-1">
                    {bet.type === 'accumulator' ? (
                      <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded">MULTIPLE ({bet.selections.length})</span>
                    ) : (
                      <span className="text-brand">{bet.matchId}</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Stake: <span className="text-white">{bet.amount}</span> • Odds: {bet.odds}x • Potential: <span className="text-green-400">{bet.potentialWin}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 font-black px-2 py-1 rounded text-xs ${
                    bet.status === 'won' ? 'bg-green-500/20 text-green-400' : 
                    bet.status === 'lost' ? 'bg-red-500/20 text-red-400' : 
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {bet.status === 'won' ? <CheckCircle size={14}/> : bet.status === 'lost' ? <XCircle size={14}/> : <Clock size={14}/>}
                    {bet.status.toUpperCase()}
                  </div>
                  {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
              </div>

              {/* Card Body (Expanded details) */}
              {isExpanded && (
                <div className="bg-dark/50 p-4 border-t border-gray-700 text-sm">
                  {bet.type === 'accumulator' ? (
                    <div>
                      <h4 className="font-bold text-gray-300 mb-2">Selections:</h4>
                      <div className="space-y-2">
                        {bet.selections.map((sel, i) => (
                          <div key={i} className="flex justify-between bg-card p-2 rounded border border-gray-800">
                            <div>
                              <div className="text-white font-bold">{sel.home} vs {sel.away}</div>
                              <div className="text-xs text-gray-500">{sel.matchId}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-brand">{sel.pick.toUpperCase()}</div>
                              <div className="text-xs text-gray-400">@{sel.odds}x</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-bold text-gray-300 mb-1">Single Pick:</h4>
                      <div className="bg-card p-2 rounded border border-gray-800 flex justify-between">
                        <span className="font-bold text-brand">{bet.pick.toUpperCase()}</span>
                        <span className="text-gray-400">@{bet.odds}x</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-400">
                    <span>Date: {new Date(bet.placedAt).toLocaleString()}</span>
                    <span>ID: {bet.id}</span>
                  </div>
                </div>
              )}

            </div>
          );
        })}
        {displayBets.length === 0 && <div className="text-gray-500 text-center p-10 bg-card rounded-xl">No {tab} bets placed yet.</div>}
      </div>
    </div>
  );
                                }
