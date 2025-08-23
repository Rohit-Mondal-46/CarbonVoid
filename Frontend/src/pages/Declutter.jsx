// src/pages/Declutter.jsx

import React, { useEffect, useState } from 'react';
import { fetchDeclutterAndStats } from '../services/declutter';
import DeclutterAndStats from '../components/DeclutterAndStats';

const Declutter = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchDeclutterAndStats();
        setSuggestions(data.suggestions || []);
        setStats(data.stats || {});
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    getData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">📊 Digital Declutter Dashboard</h1>
      <DeclutterAndStats suggestions={suggestions} stats={stats} />
    </div>
  );
};

export default Declutter;
