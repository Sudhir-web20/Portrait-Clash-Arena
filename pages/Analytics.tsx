import React, { useEffect, useState } from 'react';
import { dbService } from '../db';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setData(dbService.getAnalytics());
  }, []);

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12">
      <h1 className="text-4xl font-display font-black text-white mb-8">Arena Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass p-8 rounded-3xl border-l-4 border-l-blue-500">
          <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Total Votes</div>
          <div className="text-4xl font-black text-white">{data.totalVotes}</div>
        </div>
        <div className="glass p-8 rounded-3xl border-l-4 border-l-purple-500">
          <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Unique Voters</div>
          <div className="text-4xl font-black text-white">{data.uniqueVoters}</div>
        </div>
        <div className="glass p-8 rounded-3xl border-l-4 border-l-emerald-500">
          <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Matchups Created</div>
          <div className="text-4xl font-black text-white">{data.totalClashes}</div>
        </div>
      </div>
      
      <div className="glass p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-white mb-6">Peak Voting Hours</h3>
        <div className="h-48 flex items-end gap-2">
          {Array.from({ length: 24 }).map((_, i) => {
            const count = data.votesByHour[i] || 0;
            const height = Math.max(5, (count / (Math.max(...Object.values(data.votesByHour) as number[]) || 1)) * 100);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-blue-600/40 rounded-t-sm" style={{ height: `${height}%` }}></div>
                <div className="text-[8px] font-black text-gray-600">{i}h</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
