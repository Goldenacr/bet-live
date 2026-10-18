import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ticket, Trash2, CheckCircle } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Sportsbook() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [slip, setSlip] = useState([]);
  const [amount, setAmount] = useState('');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get(`${API_URL}/matches`);
      const data = Object.values(res.data.matches).filter(m => m.status === 'scheduled');
      setMatches(data);
    };
    fetchMatches();
  }, []);

  const togglePick = (match, pick, odds, label) => {
    setSlip(prev => {
      // Remove this match from slip if it's already there (only one bet per match)
      const filtered = prev.filter(p => p.matchId !== match.id);
      
      // If the exact same pick is clicked again, just remove it (unselect)
      const existing = prev.find(p => p.matchId === match.id && p.pick === pick);
      if (existing) return filtered;

      // Otherwise, add the new pick
      return [...filtered, { matchId: match.id, home: match.home, away: match.away, pick, odds, label }];
    });
  };

  const totalOdds = slip.reduce((acc, curr) => acc * curr.odds, 1).toFixed(2);
  const potentialWin = amount ? Math.floor(parseInt(amount) * parseFloat(totalOdds)) : 0;

  const handlePlaceBet = async () => {
    if (!user) return setMessage('Please login in Settings first.');
    if (slip.length === 0) return setMessage('Select at least one match.');
    if (!amount || isNaN(amount)) return setMessage('Enter a valid amount.');

    setPlacing(true);
    setMessage('');

    try {
      if (slip.length === 1) {
        // SINGLE BET
        const res = await axios.post(`${API_URL}/api/bets/place`, { 
          matchId: slip[0].matchId, pick: slip[0].pick, amount: parseInt(amount), userJid: user.jid 
        });
        if (res.data.success) setMessage(`✅ Single Bet placed! Potential: ${res.data.bet.potentialWin}`);
      } else {
        // MULTIPLE BET (ACCUMULATOR)
        const res = await axios.post(`${API_URL}/api/bets/place-multiple`, { 
          selections: slip, amount: parseInt(amount), userJid: user.jid 
        });
        if (res.data.success) setMessage(`✅ Accumulator placed! Potential: ${res.data.bet.potentialWin}`);
      }
      setSlip([]);
      setAmount('');
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Failed to place bet'}`);
    }
    setPlacing(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2"><Ticket /> Sportsbook</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MATCHES LIST */}
        <div className="lg:col-span-2 space-y-4">
          {matches.map(match => (
            <div key={match.id} className="bg-card p-4 rounded-xl border border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-400">{match.league}</span>
                <span className="text-xs font-bold text-gray-500">{match.id}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-lg w-1/3 text-right pr-4">{match.home}</div>
                <div className="text-gray-500 text-sm">vs</div>
                <div className="font-bold text-lg w-1/3 pl-4">{match.away}</div>
              </div>
              
              {/* ODDS SECTION */}
              <div className="space-y-3">
                {/* 1X2 */}
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => togglePick(match, 'home', 2.0, 'Home')} className={`p-2 rounded font-bold text-xs border ${slip.find(p => p.matchId === match.id && p.pick === 'home') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>1 (2.0x)</button>
                  <button onClick={() => togglePick(match, 'draw', 3.0, 'Draw')} className={`p-2 rounded font-bold text-xs border ${slip.find(p => p.matchId === match.id && p.pick === 'draw') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>X (3.0x)</button>
                  <button onClick={() => togglePick(match, 'away', 2.5, 'Away')} className={`p-2 rounded font-bold text-xs border ${slip.find(p => p.matchId === match.id && p.pick === 'away') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>2 (2.5x)</button>
                </div>
                
                {/* Additional Odds Row */}
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => togglePick(match, 'btts_yes', 1.8, 'BTTS Yes')} className={`p-2 rounded font-bold text-[10px] border ${slip.find(p => p.matchId === match.id && p.pick === 'btts_yes') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>BTTS (1.8x)</button>
                  <button onClick={() => togglePick(match, 'over_2.5', 1.9, 'Over 2.5')} className={`p-2 rounded font-bold text-[10px] border ${slip.find(p => p.matchId === match.id && p.pick === 'over_2.5') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>Over 2.5 (1.9x)</button>
                  <button onClick={() => togglePick(match, 'homeordraw', 1.3, '1X')} className={`p-2 rounded font-bold text-[10px] border ${slip.find(p => p.matchId === match.id && p.pick === 'homeordraw') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>1X (1.3x)</button>
                  <button onClick={() => togglePick(match, 'draworaway', 1.4, 'X2')} className={`p-2 rounded font-bold text-[10px] border ${slip.find(p => p.matchId === match.id && p.pick === 'draworaway') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300'}`}>X2 (1.4x)</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BET SLIP */}
        <div className="bg-card rounded-xl border border-gray-700 p-4 h-fit sticky top-6">
          <h2 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 flex justify-between">
            Bet Slip <span className="bg-brand text-white text-xs px-2 py-1 rounded-full">{slip.length}</span>
          </h2>

          {slip.length === 0 ? (
            <div className="text-center text-gray-500 py-10 text-sm">Click on odds to add selections to your slip.</div>
          ) : (
            <div className="space-y-3 mb-6">
              {slip.map((item, idx) => (
                <div key={idx} className="bg-dark p-3 rounded-lg border border-gray-700 relative">
                  <button onClick={() => togglePick({id: item.matchId}, item.pick)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
                  <div className="text-xs text-gray-400">{item.home} vs {item.away}</div>
                  <div className="font-bold text-sm text-brand mt-1">{item.label} @ {item.odds}x</div>
                </div>
              ))}
            </div>
          )}

          {slip.length > 0 && (
            <>
              <div className="bg-dark p-3 rounded-lg mb-4 flex justify-between items-center border border-gray-700">
                <span className="text-sm text-gray-400">Total Odds</span>
                <span className="text-lg font-black text-green-400">{slip.length > 1 ? totalOdds : slip[0].odds}x</span>
              </div>

              <label className="block text-xs font-bold text-gray-400 mb-2">Stake (Coins)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white font-bold mb-3" placeholder="e.g. 500"/>
              
              {amount && (
                <div className="flex justify-between text-sm mb-4 text-green-400 font-bold">
                  <span>Potential Win:</span>
                  <span>{slip.length > 1 ? potentialWin : Math.floor(amount * slip[0].odds)}</span>
                </div>
              )}

              <button onClick={handlePlaceBet} disabled={placing} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-lg flex justify-center items-center gap-2">
                {placing ? 'Processing...' : slip.length === 1 ? 'Confirm Single Bet' : 'Confirm Multiple Bet'}
              </button>
            </>
          )}
          
          {message && <div className="mt-4 text-center text-sm font-bold text-gray-300 bg-dark p-2 rounded">{message}</div>}
          {user && <div className="text-center text-xs text-gray-500 mt-4">Balance: {user.balance === 'unlimited' ? '∞' : user.balance} coins</div>}
        </div>
      </div>
    </div>
  );
                                                                                                                                                      }
