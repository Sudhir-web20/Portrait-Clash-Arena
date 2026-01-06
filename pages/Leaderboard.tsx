import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dbService } from '../db';
import { Personality } from '../types';

const RankBadge: React.FC<{ tier: string }> = ({ tier }) => {
  const colors: Record<string, string> = {
    Bronze: 'bg-amber-800 text-amber-200 border-amber-600',
    Silver: 'bg-slate-400 text-slate-900 border-slate-300',
    Gold: 'bg-yellow-500 text-yellow-950 border-yellow-400',
    Platinum: 'bg-cyan-400 text-cyan-950 border-cyan-300',
    Diamond: 'bg-blue-600 text-blue-100 border-blue-400',
    Challenger: 'bg-gradient-to-r from-red-600 to-purple-600 text-white border-white/30 animate-pulse'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${colors[tier] || 'bg-gray-500 text-white'}`}>
      {tier}
    </span>
  );
};

const Leaderboard: React.FC = () => {
  const [stats, setStats] = useState<Personality[]>([]);

  const loadStats = () => {
    setStats(dbService.getStats());
  };

  useEffect(() => {
    loadStats();
    window.addEventListener('storage', loadStats);
    return () => window.removeEventListener('storage', loadStats);
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-black text-red-500 uppercase tracking-[0.3em]">Global Rankings</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-white leading-none">The Hall of Fame</h1>
          <p className="text-gray-500 text-lg max-w-xl mt-4">
            Sorted by Elo rating. The most dominant personalities in the history of the Arena.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {stats.map((p, index) => (
          <Link 
            to={`/personality/${p.id}`}
            key={p.id}
            className={`glass group flex flex-col md:flex-row items-center gap-6 p-4 rounded-3xl transition-all hover:bg-white/5 border-l-4 ${index === 0 ? 'border-l-yellow-500' : index === 1 ? 'border-l-gray-400' : index === 2 ? 'border-l-amber-700' : 'border-l-transparent'}`}
          >
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="text-4xl font-display font-black text-white/20 w-12 text-center">
                #{index + 1}
              </div>

              <div 
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-cover bg-center ring-2 ring-white/10 shrink-0 shadow-2xl"
                style={{ backgroundImage: `url(${p.imageUrl})` }}
              />

              <div className="flex-grow">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</h3>
                  <RankBadge tier={p.rankTier} />
                  {p.streak >= 3 && (
                    <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse border border-red-500/30">
                      🔥 HOT {p.streak}
                    </span>
                  )}
                  {p.streak <= -3 && (
                    <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                      ❄️ COLD {Math.abs(p.streak)}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm line-clamp-1 mt-1">{p.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8 md:px-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-black text-white">{p.elo}</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Elo Rating</div>
              </div>
              
              <div className="text-center border-l border-white/10 pl-4 md:pl-8">
                <div className="text-lg md:text-2xl font-bold text-gray-300">
                  {((p.stats.wins / (p.stats.totalVotes || 1)) * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Win Rate</div>
              </div>

              <div className="hidden lg:block text-center border-l border-white/10 pl-8">
                <div className="text-xl font-bold text-gray-400">{p.stats.totalVotes}</div>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Battles</div>
              </div>
            </div>
          </Link>
        ))}

        {stats.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl">
            <p className="text-gray-400 italic">The arena is empty. Waiting for challengers...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;