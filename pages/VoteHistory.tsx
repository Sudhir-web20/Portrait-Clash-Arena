import React, { useEffect, useState } from 'react';
import { dbService } from '../db';
import { Vote, Personality } from '../types';

const VoteHistory: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [personalities, setPersonalities] = useState<Personality[]>([]);

  useEffect(() => {
    const user = dbService.getUser();
    const allVotes = dbService.getRecentVotes();
    setVotes(allVotes.filter(v => v.sessionId === localStorage.getItem('pca_session_id')));
    setPersonalities(dbService.getPersonalities());
  }, []);

  const getName = (id: string) => personalities.find(p => p.id === id)?.name || 'Unknown';

  const exportData = (format: 'json' | 'csv') => {
    let content = '';
    if (format === 'json') {
      content = JSON.stringify(votes, null, 2);
    } else {
      content = 'Date,Winner,Loser,Influence\n' + 
        votes.map(v => `${new Date(v.timestamp).toISOString()},${getName(v.winnerId)},${getName(v.loserId)},${v.influenceGained}`).join('\n');
    }
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portrait-clash-history.${format}`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-display font-black text-white">Your History</h1>
        <div className="flex gap-2">
          <button onClick={() => exportData('csv')} className="px-4 py-2 glass rounded-xl text-xs font-black uppercase">CSV</button>
          <button onClick={() => exportData('json')} className="px-4 py-2 glass rounded-xl text-xs font-black uppercase">JSON</button>
        </div>
      </div>
      <div className="space-y-3">
        {votes.map(v => (
          <div key={v.id} className="glass p-6 rounded-2xl flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">✓</div>
              <div>
                <div className="text-white font-bold">{getName(v.winnerId)} <span className="text-gray-500 font-normal">defeated</span> {getName(v.loserId)}</div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">{new Date(v.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <div className="text-blue-400 font-black">+{v.influenceGained} INF</div>
          </div>
        ))}
        {votes.length === 0 && <p className="text-center py-20 text-gray-500 italic">No arena strikes recorded yet.</p>}
      </div>
    </div>
  );
};

export default VoteHistory;
