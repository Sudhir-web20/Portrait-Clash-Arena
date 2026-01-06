import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../db';
import { Personality, Vote } from '../types';

const PersonalityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Personality | null>(null);
  const [recentVotes, setRecentVotes] = useState<Vote[]>([]);
  const [allPersonalities, setAllPersonalities] = useState<Personality[]>([]);

  useEffect(() => {
    const p = dbService.getPersonalities().find(item => item.id === id);
    if (!p) {
      navigate('/leaderboard');
      return;
    }
    setPerson(p);
    setAllPersonalities(dbService.getPersonalities());
    setRecentVotes(dbService.getRecentVotes().filter(v => v.winnerId === id || v.loserId === id));
  }, [id, navigate]);

  if (!person) return null;

  const winRate = person.stats.totalVotes > 0 ? (person.stats.wins / person.stats.totalVotes) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button 
        onClick={() => navigate('/leaderboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-black uppercase tracking-widest">Back to Hall of Fame</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative group overflow-hidden rounded-[2.5rem]">
            <img src={person.imageUrl} alt={person.name} className="w-full aspect-square object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
               <div className="flex items-center gap-2 mb-2">
                 <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{person.rankTier}</span>
               </div>
               <h1 className="text-4xl font-display font-black text-white">{person.name}</h1>
            </div>
          </div>
          
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Biography</h3>
            <p className="text-gray-300 leading-relaxed italic">"{person.description}"</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-6 rounded-3xl text-center">
              <div className="text-3xl font-black text-white">{person.elo}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Elo Rating</div>
            </div>
            <div className="glass p-6 rounded-3xl text-center">
              <div className="text-3xl font-black text-blue-400">{winRate.toFixed(1)}%</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Win Rate</div>
            </div>
            <div className="glass p-6 rounded-3xl text-center">
              <div className="text-3xl font-black text-emerald-500">{person.stats.wins}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Victories</div>
            </div>
            <div className="glass p-6 rounded-3xl text-center">
              <div className="text-3xl font-black text-red-500">{person.stats.losses}</div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Defeats</div>
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
            <h3 className="text-lg font-bold text-white mb-6">Recent Combat History</h3>
            <div className="space-y-4">
              {recentVotes.map(v => {
                const isWinner = v.winnerId === person.id;
                const opponentId = isWinner ? v.loserId : v.winnerId;
                const opponent = allPersonalities.find(p => p.id === opponentId);
                const eloDiff = isWinner ? v.winnerEloAfter - v.winnerEloBefore : v.loserEloAfter - v.loserEloBefore;
                
                return (
                  <div key={v.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${isWinner ? 'bg-emerald-500 text-emerald-950' : 'bg-red-500 text-red-950'}`}>
                        {isWinner ? 'W' : 'L'}
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">vs <span className="text-white font-bold">{opponent?.name || 'Unknown'}</span></div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">{new Date(v.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`font-black text-sm ${eloDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {eloDiff > 0 ? '+' : ''}{eloDiff} Elo
                    </div>
                  </div>
                );
              })}
              {recentVotes.length === 0 && (
                <p className="text-gray-500 italic text-center py-8">No recent battle data recorded.</p>
              )}
            </div>
          </div>

          <div className="glass p-8 rounded-3xl">
             <h3 className="text-lg font-bold text-white mb-6">Performance Trajectory</h3>
             <div className="h-24 flex items-end gap-1">
                {person.history.map((h, i) => {
                  const height = ((h.elo - 800) / 1200) * 100;
                  return (
                    <div 
                      key={i} 
                      className="flex-1 bg-blue-600/30 hover:bg-blue-500 transition-colors rounded-t-sm relative group"
                      style={{ height: `${Math.max(10, height)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                        {h.elo}
                      </div>
                    </div>
                  );
                })}
             </div>
             <div className="flex justify-between mt-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
               <span>Bronze Start</span>
               <span>Arena Dominance</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityDetail;