
import React, { useEffect, useState } from 'react';
import { dbService } from '../db';

const Leaderboard: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);

  const loadStats = () => {
    setStats(dbService.getStats());
  };

  useEffect(() => {
    loadStats();
    // Simulate real-time updates via storage event
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12">
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-5xl font-display font-black text-white mb-4">Top Portraits by Win Rate</h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Ranked by head-to-head victories across all clashes. Only the strongest survive in the Portrait Clash Arena.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {stats.map((p, index) => (
          <div 
            key={p.id}
            className={`glass group flex items-center gap-6 p-4 rounded-3xl transition-all hover:bg-white/5 border-l-8 ${index === 0 ? 'border-l-yellow-500' : index === 1 ? 'border-l-gray-400' : index === 2 ? 'border-l-amber-700' : 'border-l-transparent'}`}
          >
            <div className="text-4xl font-display font-black text-white/20 w-12 text-center">
              #{index + 1}
            </div>

            <div 
              className="w-20 h-20 rounded-2xl bg-cover bg-center ring-2 ring-white/10"
              style={{ backgroundImage: `url(${p.imageUrl})` }}
            />

            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-1">{p.description}</p>
            </div>

            <div className="flex items-center gap-8 px-6">
              <div className="text-center">
                <div className="text-3xl font-black text-white">{p.winRate.toFixed(1)}%</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Win Rate</div>
              </div>
              <div className="hidden md:block text-center border-l border-white/10 pl-8">
                <div className="text-2xl font-bold text-gray-300">{p.stats.wins}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Wins</div>
              </div>
              <div className="hidden md:block text-center border-l border-white/10 pl-8">
                <div className="text-2xl font-bold text-gray-300">{p.stats.totalVotes}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</div>
              </div>
            </div>
          </div>
        ))}

        {stats.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl">
            <p className="text-gray-400 italic">No personalities found in the arena yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
