import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ticket } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function MyBets() {
  const { user } = useAuth();
  const [bets, setBets] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchBets = async () => {
      const res = await axios.get(`${API_URL}/bets`);
      const myBets = Object.values(res.data.bets).filter(b => b.user === user.jid).sort((a,b) => b.placedAt - a.placedAt);
      setBets(myBets);
    };
    fetchBets();
  }, [user]);

  if (!user) return <div className="p-10 text-center text-gray-400">Please login in Settings to view your bets.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2"><Ticket /> My Bet History</h1>
      <div className="space-y-3">
        {bets.map(bet => (
          <div key={bet.id} className="bg-card p-4 rounded-xl border border-gray-700 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">{bet.matchId} • {bet.pick.toUpperCase()}</div>
              <div className="text-xs text-gray-400">Stake: {bet.amount} • Odds: {bet.odds}x</div>
            </div>
            <div className={`font-black ${bet.status === 'won' ? 'text-green-400' : bet.status === 'lost' ? 'text-red-400' : 'text-yellow-400'}`}>{bet.status.toUpperCase()}</div>
          </div>
        ))}
        {bets.length === 0 && <div className="text-gray-500 text-center">No bets placed yet.</div>}
      </div>
    </div>
  );
}
