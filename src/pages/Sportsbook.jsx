import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ticket, Trash2, X, ChevronUp } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Sportsbook() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [slip, setSlip] = useState([]);
  const [amount, setAmount] = useState('');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');
  const [isSlipOpen, setIsSlipOpen] = useState(false);

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
      const filtered = prev.filter(p => p.matchId !== match.id);
      const existing = prev.find(p => p.matchId === match.id && p.pick === pick);
      if (existing) return filtered;
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
        const res = await axios.post(`${API_URL}/api/bets/place`, { 
          matchId: slip[0].matchId, pick: slip[0].pick, amount: parseInt(amount), userJid: user.jid 
        });
        if (res.data.success) setMessage(`✅ Single Bet placed! Potential: ${res.data.bet.potentialWin}`);
      } else {
        const res = await axios.post(`${API_URL}/api/bets/place-multiple`, { 
          selections: slip, amount: parseInt(amount), userJid: user.jid 
        });
        if (res.data.success) setMessage(`✅ Accumulator placed! Potential: ${res.data.bet.potentialWin}`);
      }
      setSlip([]);
      setAmount('');
      setIsSlipOpen(false);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Failed to place bet'}`);
    }
    setPlacing(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2"><Ticket /> Sportsbook</h1>
      
      <div className="space-y-4">
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
            
            {/* 1X2 SECTION */}
            <div className="mb-3">
              <div className="text-xs font-bold text-gray-400 mb-2 uppercase">1X2 - Match Result</div>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => togglePick(match, 'home', 2.0, 'Home')} className={`p-3 rounded font-bold text-sm border transition-colors ${slip.find(p => p.matchId === match.id && p.pick === 'home') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>Home (2.0x)</button>
                <button onClick={() => togglePick(match, 'draw', 3.0, 'Draw')} className={`p-3 rounded font-bold text-sm border transition-colors ${slip.find(p => p.matchId === match.id && p.pick === 'draw') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>Draw (3.0x)</button>
                <button onClick={() => togglePick(match, 'away', 2.5, 'Away')} className={`p-3 rounded font-bold text-sm border transition-colors ${slip.find(p => p.matchId === match.id && p.pick === 'away') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>Away (2.5x)</button>
              </div>
            </div>

            {/* OTHER ODDS SECTION */}
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Goals & Specials</div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button onClick={() => togglePick(match, 'over_2.5', 1.9, 'Over 2.5')} className={`p-2 rounded font-bold text-xs border transition-colors ${slip.find(p => p.matchId === match.id && p.pick === 'over_2.5') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>Over 2.5 (1.9x)</button>
                <button onClick={() => togglePick(match, 'under_2.5', 1.9, 'Under 2.5')} className={`p-2 rounded font-bold text-xs border transition-colors ${slip.find(p => p.matchId === match.id && p.pick === 'under_2.5') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>Under 2.5 (1.9x)</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => togglePick(match, 'btts_yes', 1.8, 'BTTS Yes')} className={`p-2 rounded font-bold text-xs border transition-colors ${slip.find(p => p.matchId === match.id && p.pick === 'btts_yes') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>BTTS Yes (1.8x)</button>
                <button onClick={() => togglePick(match, 'btts_no', 2.0, 'BTTS No')} className={`p-2 rounded font-bold text-xs border transition-colors ${slip.find(p => p.matchId === match.id && p.pick === 'btts_no') ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>BTTS No (2.0x)</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FLOATING BET SLIP BUTTON */}
      {slip.length > 0 && !isSlipOpen && (
        <button onClick={() => setIsSlipOpen(true)} className="fixed bottom-6 right-6 bg-brand text-white rounded-full p-4 shadow-2xl flex items-center justify-center animate-bounce z-40">
          <Ticket size={24} />
          <span className="absolute -top-2 -right-2 bg-white text-brand font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-brand">
            {slip.length}
          </span>
        </button>
      )}

      {/* BET SLIP MODAL */}
      {isSlipOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-end md:items-center p-0 md:p-4">
          <div className="bg-card w-full max-w-lg rounded-t-2xl md:rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h2 className="text-lg font-bold flex items-center gap-2"><Ticket /> Bet Slip ({slip.length})</h2>
              <button onClick={() => setIsSlipOpen(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {slip.map((item, idx) => (
                <div key={idx} className="bg-dark p-3 rounded-lg border border-gray-700 relative">
                  <button onClick={() => togglePick({id: item.matchId}, item.pick)} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                  <div className="text-xs text-gray-400">{item.home} vs {item.away}</div>
                  <div className="font-bold text-sm text-brand mt-1">{item.label} @ {item.odds}x</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700 bg-dark rounded-b-2xl">
              <div className="flex justify-between items-center mb-4 bg-card p-3 rounded-lg border border-gray-700">
                <span className="text-sm text-gray-400">Total Odds</span>
                <span className="text-lg font-black text-green-400">{slip.length > 1 ? totalOdds : slip[0].odds}x</span>
              </div>

              <label className="block text-xs font-bold text-gray-400 mb-2">Stake (Coins)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-card border border-gray-700 rounded-lg p-3 text-white font-bold mb-3" placeholder="e.g. 500"/>
              
              {amount && (
                <div className="flex justify-between text-sm mb-4 text-green-400 font-bold">
                  <span>Potential Win:</span>
                  <span>{slip.length > 1 ? potentialWin : Math.floor(amount * slip[0].odds)}</span>
                </div>
              )}

              <button onClick={handlePlaceBet} disabled={placing} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-lg flex justify-center items-center gap-2">
                {placing ? 'Processing...' : slip.length === 1 ? 'Confirm Single Bet' : `Confirm Multiple Bet (${slip.length})`}
              </button>
            </div>

          </div>
        </div>
      )}

      {message && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-dark text-white font-bold p-3 rounded-lg shadow-xl z-50 border border-gray-700">{message}</div>}
      {user && <div className="fixed top-20 right-4 bg-card text-xs text-gray-400 p-2 rounded border border-gray-700 z-30">Balance: {user.balance === 'unlimited' ? '∞' : user.balance} coins</div>}
    </div>
  );
            }
