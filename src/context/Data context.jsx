import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const DataContext = createContext();
const API_URL = 'https://ciphertech-api.onrender.com';

export const DataProvider = ({ children }) => {
  const [matches, setMatches] = useState({});
  const [bets, setBets] = useState({});
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matchesRes, betsRes, standingsRes] = await Promise.all([
        axios.get(`${API_URL}/matches`),
        axios.get(`${API_URL}/bets`),
        axios.get(`${API_URL}/standings`)
      ]);
      
      if (matchesRes.data.success) setMatches(matchesRes.data.matches);
      if (betsRes.data.success) setBets(betsRes.data.bets);
      if (standingsRes.data.success) setStandings(standingsRes.data.standings);
    } catch (err) {
      console.error("Data fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Background refresh every 20 seconds
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ matches, bets, standings, loading, refresh: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
