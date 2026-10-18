import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Shield } from 'lucide-react';

const API_URL = 'https://ciphertech-api.onrender.com';

export default function Standings() {
  const [standings, setStandings] = useState({});
  const [activeLeague, setActiveLeague] = useState('Premier League');

  useEffect(() => {
    const fetchStandings = async () => {
      const res = await axios.get(`${API_URL}/standings`);
      if (res.data.success && Object.keys(res.data.standings).length > 0) {
        setStandings(res.data.standings);
        if (!res.data.standings[activeLeague]) {
          setActiveLeague(Object.keys(res.data.standings)[0]);
        }
      }
    };
    fetchStandings();
  }, []);

  const leagues = Object.keys(standings);
  const currentTable = standings[activeLeague] ? Object.values(standings[activeLeague]).sort((a,b) => b.pts - a.pts || b.gd - a.gd) : [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black mb-6 flex items-center gap-2 text-yellow-500"><Trophy size={24}/> League Standings</h1>
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {leagues.map(league => (
          <button key={league} onClick={() => setActiveLeague(league)} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${activeLeague === league ? 'bg-brand text-white' : 'bg-card text-gray-400 hover:bg-gray-800'}`}>{league}</button>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-dark text-gray-400 border-b border-gray-700">
            <tr>
              <th className="p-4 font-bold">#</th><th className="p-4 font-bold">Team</th><th className="p-4 font-bold text-center">P</th><th className="p-4 font-bold text-center">W</th><th className="p-4 font-bold text-center">D</th><th className="p-4 font-bold text-center">L</th><th className="p-4 font-bold text-center">GD</th><th className="p-4 font-bold text-center text-brand">PTS</th>
            </tr>
          </thead>
          <tbody>
            {currentTable.map((team, idx) => (
              <tr key={team.name} className="border-b border-gray-800/50 hover:bg-dark/50 transition-colors">
                <td className="p-4 font-bold text-gray-500">{idx + 1}</td>
                <td className="p-4 font-bold text-white flex items-center gap-2"><Shield size={14} className="text-gray-600"/> {team.name}</td>
                <td className="p-4 text-center text-gray-300">{team.played}</td><td className="p-4 text-center text-green-400">{team.won}</td><td className="p-4 text-center text-gray-300">{team.drawn}</td><td className="p-4 text-center text-red-400">{team.lost}</td><td className="p-4 text-center text-gray-300">{team.gd > 0 ? `+${team.gd}` : team.gd}</td><td className="p-4 text-center font-black text-brand">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {currentTable.length === 0 && <div className="p-10 text-center text-gray-500">No standings data available for this league yet.</div>}
      </div>
    </div>
  );
                }
