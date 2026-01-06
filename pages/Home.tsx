
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="max-w-4xl space-y-8">
        <div className="space-y-4">
          <span className="inline-block py-1 px-4 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 font-semibold text-sm tracking-wide animate-pulse">
            THE ARENA IS NOW OPEN
          </span>
          <h1 className="text-6xl md:text-8xl font-display font-black text-white leading-tight">
            Portrait <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Clash Arena</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Witness the ultimate showdown. Vote for the personalities that inspire you and help crown the champion of the global leaderboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => navigate('/clash')}
            className="group relative px-10 py-5 bg-white text-black font-bold text-lg rounded-xl transition-all hover:bg-blue-500 hover:text-white overflow-hidden"
          >
            <span className="relative z-10">Start Voting Now</span>
            <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
          <button 
            onClick={() => navigate('/leaderboard')}
            className="px-10 py-5 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all"
          >
            View Leaderboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="glass p-8 rounded-2xl text-left border-l-4 border-l-blue-500">
            <h3 className="text-xl font-bold mb-2">Face-Off</h3>
            <p className="text-gray-500">Experience high-stakes side-by-side voting between iconic figures.</p>
          </div>
          <div className="glass p-8 rounded-2xl text-left border-l-4 border-l-purple-500">
            <h3 className="text-xl font-bold mb-2">Real-Time</h3>
            <p className="text-gray-500">Every vote ripples through the arena, updating rankings instantly.</p>
          </div>
          <div className="glass p-8 rounded-2xl text-left border-l-4 border-l-emerald-500">
            <h3 className="text-xl font-bold mb-2">Fair Play</h3>
            <p className="text-gray-500">One vote per clash ensures the truest representation of preference.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
