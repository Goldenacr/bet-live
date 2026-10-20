import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Ticket, Trash2, X } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Sportsbook() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [slip, setSlip] = useState([]);
  const [amount, setAmount] = useState('');
  const [betType, setBetType] = useState('multiple'); 
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  
  // Track active market tab per match
  const [marketTabs, setMarketTabs] = useState({});

  useEffect(() => {
    const fetchMatches = async () => {
      const res = await axios.get(`${API_URL}/matches`);
      setMatches(Object.values(res.data.matches).filter(m => m.status === 'scheduled'));
    };
    fetchMatches();
  }, []);

  const changeTab = (matchId, tab) => setMarketTabs(prev => ({ ...prev, [matchId]: tab }));

  const togglePick = (match, pick, odds, label) => {
    setSlip(prev => {
      const filtered = prev.filter(p => p.matchId !== match.id);
      if (prev.find(p => p.matchId === match.id && p.pick === pick)) return filtered;
      return [...filtered, { matchId: match.id, home: match.home, away: match.away, pick, odds, label }];
    });
  };

  const totalOdds = slip.reduce((acc, curr) => acc * curr.odds, 1).toFixed(2);
  let potentialWin = 0, totalCost = 0;
  if (amount) {
    if (betType === 'multiple') { potentialWin = Math.floor(parseInt(amount) * parseFloat(totalOdds)); totalCost = parseInt(amount); }
    else { potentialWin = slip.reduce((acc, curr) => acc + Math.floor(parseInt(amount) * curr.odds), 0); totalCost = parseInt(amount) * slip.length; }
  }

  const handlePlaceBet = async () => {
    if (!user) return setMessage('Login first.');
    if (slip.length === 0) return setMessage('Select a match.');
    if (!amount || isNaN(amount)) return setMessage('Enter amount.');

    setPlacing(true); setMessage('');
    try {
      const res = await axios.post(`${API_URL}/api/bets/place-multiple`, { selections: slip, amount: parseInt(amount), userJid: user.jid, type: betType });
      if (res.data.success) {
        setMessage(`✅ Success: ${res.data.message}!`);
        setTimeout(() => { setSlip([]); setAmount(''); setIsSlipOpen(false); setMessage(''); }, 2500);
      }
    } catch (err) { setMessage(`❌ ${err.response?.data?.message || 'Failed'}`); }
    setPlacing(false);
  };

  // Helper to render odds button
  const OddBtn = ({ match, pick, odds, label }) => {
    const isSelected = slip.find(p => p.matchId === match.id && p.pick === pick);
    return (
      <button onClick={() => togglePick(match, pick, odds, label)} className={`p-2 rounded font-bold text-xs border transition-colors ${isSelected ? 'bg-brand border-brand text-white' : 'bg-dark border-gray-700 text-gray-300 hover:border-brand'}`}>
        {label} <br/> <span className="text-[10px] text-green-400">{odds}x</span>
      </button>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2"><Ticket /> Place Bets</h1>
      
      <div className="space-y-6">
        {matches.map(match => {
          const currentTab = marketTabs[match.id] || '1X2';
          return (
            <div key={match.id} className="bg-card rounded-xl border border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700 bg-dark/50 flex justify-between items-center">
                <div className="font-bold text-lg">{match.home} <span className="text-gray-500 text-sm font-normal">vs</span> {match.away}</div>
                <div className="text-xs text-gray-500">{match.league}</div>
              </div>

              {/* MARKET TABS */}
              <div className="flex overflow-x-auto border-b border-gray-700 bg-dark text-xs font-bold">
                {['1X2', 'O/U', 'HDP', '1st Half', '10 Min', 'Score'].map(tab => (
                  <button key={tab} onClick={() => changeTab(match.id, tab)} className={`px-4 py-3 whitespace-nowrap ${currentTab === tab ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}>{tab}</button>
                ))}
              </div>

              {/* ODDS CONTENT */}
              <div className="p-4">
                {currentTab === '1X2' && (
                  <div className="grid grid-cols-3 gap-2">
                    <OddBtn match={match} pick="home" odds={2.0} label="Home" />
                    <OddBtn match={match} pick="draw" odds={3.0} label="Draw" />
                    <OddBtn match={match} pick="away" odds={2.5} label="Away" />
                  </div>
                )}
                
                {currentTab === 'O/U' && (
                  <div className="space-y-2">
                    {[0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5].map(line => (
                      <div key={line} className="grid grid-cols-2 gap-2">
                        <OddBtn match={match} pick={`over_${line}`} odds={1.9} label={`Over ${line}`} />
                        <OddBtn match={match} pick={`under_${line}`} odds={1.9} label={`Under ${line}`} />
                      </div>
                    ))}
                  </div>
                )}

                {currentTab === 'HDP' && (
                  <div className="space-y-2">
                    {[-2, -1, +1, +2].map(line => (
                      <div key={line} className="grid grid-cols-2 gap-2">
                        <OddBtn match={match} pick={`handicap_home_${line}`} odds={1.95} label={`Home ${line > 0 ? '+' : ''}${line}`} />
                        <OddBtn match={match} pick={`handicap_away_${line}`} odds={1.95} label={`Away ${line > 0 ? '+' : ''}${line}`} />
                      </div>
                    ))}
                  </div>
                )}

                {currentTab === '1st Half' && (
                  <div className="grid grid-cols-3 gap-2">
                    <OddBtn match={match} pick="ht_home" odds={2.5} label="HT Home" />
                    <OddBtn match={match} pick="ht_draw" odds={2.2} label="HT Draw" />
                    <OddBtn match={match} pick="ht_away" odds={3.0} label="HT Away" />
                  </div>
                )}

                {currentTab === '10 Min' && (
                  <div className="grid grid-cols-3 gap-2">
                    <OddBtn match={match} pick="first10_home" odds={4.0} label="10m Home" />
                    <OddBtn match={match} pick="first10_draw" odds={1.5} label="10m Draw" />
                    <OddBtn match={match} pick="first10_away" odds={5.0} label="10m Away" />
                  </div>
                )}

                {currentTab === 'Score' && (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-2">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(h => 
                      [0,1,2,3,4,5,6,7,8,9,10].map(a => (
                        <OddBtn key={`${h}-${a}`} match={match} pick={`score_${h}-${a}`} odds={h===a?15:10} label={`${h}-${a}`} />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING BET SLIP BUTTON */}
      {slip.length > 0 && !isSlipOpen && (
        <button onClick={() => setIsSlipOpen(true)} className="fixed bottom-6 right-6 bg-brand text-white rounded-full p-4 shadow-2xl flex items-center justify-center animate-bounce z-40">
          <Ticket size={24} /><span className="absolute -top-2 -right-2 bg-white text-brand font-black text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-brand">{slip.length}</span>
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
                  <button onClick={() => togglePick({id: item.matchId}, item.pick)} className="absolute top-2 right-2 text-red-500"><Trash2 size={16}/></button>
                  <div className="text-xs text-gray-400">{item.home} vs {item.away}</div>
                  <div className="font-bold text-sm text-brand mt-1">{item.label} @ {item.odds}x</div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 bg-dark rounded-b-2xl">
              <div className="flex bg-card rounded-lg p-1 mb-4 border border-gray-700">
                <button onClick={() => setBetType('single')} className={`flex-1 py-2 text-sm font-bold rounded-md ${betType === 'single' ? 'bg-brand text-white' : 'text-gray-400'}`}>Stake Single</button>
                <button onClick={() => setBetType('multiple')} className={`flex-1 py-2 text-sm font-bold rounded-md ${betType === 'multiple' ? 'bg-brand text-white' : 'text-gray-400'}`}>Stake Multiple</button>
              </div>

              <div className="flex justify-between items-center mb-4 bg-card p-3 rounded-lg border border-gray-700">
                {betType === 'multiple' ? ( <><span className="text-sm text-gray-400">Total Odds</span><span className="text-lg font-black text-green-400">{totalOdds}x</span></> ) : 
                ( <><span className="text-sm text-gray-400">Total Cost ({slip.length} bets)</span><span className="text-lg font-black text-brand">{totalCost.toLocaleString()}</span></> )}
              </div>

              <label className="block text-xs font-bold text-gray-400 mb-2">Stake {betType === 'single' ? 'Per Match' : 'Amount'}</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-card border border-gray-700 rounded-lg p-3 text-white font-bold mb-3 text-lg" placeholder="Enter amount"/>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[50, 100, 500, 1000].map(val => (
                  <button key={val} onClick={() => setAmount(val.toString())} className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold py-2 rounded border border-gray-700">{val}</button>
                ))}
              </div>
              
              {amount && (
                <div className="flex justify-between text-sm mb-4 text-green-400 font-bold bg-green-500/10 p-3 rounded-lg">
                  <span>Potential Win:</span><span>{potentialWin.toLocaleString()}</span>
                </div>
              )}

              <button onClick={handlePlaceBet} disabled={placing} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-lg flex justify-center items-center gap-2">
                {placing ? 'Processing...' : `Confirm ${betType === 'single' ? 'Singles' : 'Multiple'}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {message && <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-dark text-white font-bold p-3 rounded-lg shadow-xl z-50 border border-gray-700">{message}</div>}
    </div>
  );
              }
