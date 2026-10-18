import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ticket, CheckCircle, XCircle, Clock } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function MyBets() {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2"><Ticket /> My Bet History</h1>
      
      <div className="space-y-4">
        {bets.map(bet => (
          <div key={bet.id} className="bg-card p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            <div className="flex-1">
              <div className="font-bold text-white flex items-center gap-2 mb-2">
                {bet.type === 'accumulator' ? (
                  <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded">MULTIPLE ({bet.selections.length})</span>
                ) : (
                  <span className="text-brand">{bet.matchId}</span>
                )}
              </div>

              {bet.type === 'accumulator' ? (
                <div className="space-y-1">
                  {bet.selections.map((sel, i) => (
                    <div key={i} className="text-xs text-gray-300 flex gap-2">
                      <span className="text-gray-500">{sel.matchId}:</span>
                      <span className="font-bold text-brand">{sel.pick.toUpperCase()}</span> 
                      <span className="text-gray-500">@{sel.odds}x</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-300">
                  Pick: <span className="font-bold text-brand uppercase">{bet.pick.replace('_', ' ')}</span>
                </div>
              )}

              <div className="text-xs text-gray-400 mt-2">
                Stake: <span className="text-white">{bet.amount}</span> • Odds: {bet.odds}x • Potential: <span className="text-green-400">{bet.potentialWin}</span>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 font-black px-3 py-1 rounded-lg ${
              bet.status === 'won' ? 'bg-green-500/20 text-green-400' : 
              bet.status === 'lost' ? 'bg-red-500/20 text-red-400' : 
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {bet.status === 'won' ? <CheckCircle size={16}/> : bet.status === 'lost' ? <XCircle size={16}/> : <Clock size={16}/>}
              {bet.status.toUpperCase()}
            </div>
          </div>
        ))}
        {bets.length === 0 && <div className="text-gray-500 text-center p-10 bg-card rounded-xl">No bets placed yet.</div>}
      </div>
    </div>
  );
}
