
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ClashPage from './pages/Clash';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import PersonalityDetail from './pages/PersonalityDetail';
import Analytics from './pages/Analytics';
import VoteHistory from './pages/VoteHistory';
import UserHud from './components/UserHud';
import { dbService } from './db';
import { UserProfile, Achievement } from './types';
import { ToastProvider } from './components/Toast';
import { checkAchievements, ACHIEVEMENTS } from './services/achievements';
import { audioService } from './services/audio';

const AchievementNotifier: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [unlocked, setUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    const newAchievements = checkAchievements(user, []);
    if (newAchievements.length > 0) {
      const first = newAchievements[0];
      const updatedIds = [...user.unlockedAchievements, first.id];
      dbService.updateUser({ unlockedAchievements: updatedIds });
      setUnlocked(first);
      audioService.play('achievement');
      setTimeout(() => setUnlocked(null), 5000);
    }
  }, [user.voteCount, user.influence]);

  if (!unlocked) return null;

  return (
    <div className="fixed top-24 right-6 z-[250] animate-in slide-in-from-right duration-500">
      <div className="glass p-6 rounded-3xl border-2 border-yellow-400/50 bg-yellow-400/5 shadow-2xl min-w-[320px]">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{unlocked.icon}</div>
          <div>
            <div className="text-yellow-400 text-[10px] font-black uppercase tracking-widest">Achievement Unlocked</div>
            <h3 className="text-white font-bold text-lg">{unlocked.title}</h3>
            <p className="text-gray-400 text-xs">{unlocked.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p: string) => path === p || path.startsWith(p + '/');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-[100] px-4 pb-6 pointer-events-none">
      <div className="glass h-16 rounded-2xl flex items-center justify-around px-2 border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto backdrop-blur-3xl">
        <Link to="/clash" className={`flex flex-col items-center gap-1 transition-all ${isActive('/clash') ? 'text-blue-400 scale-110' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Battle</span>
        </Link>
        <Link to="/leaderboard" className={`flex flex-col items-center gap-1 transition-all ${isActive('/leaderboard') ? 'text-blue-400 scale-110' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Hall</span>
        </Link>
        <Link to="/analytics" className={`flex flex-col items-center gap-1 transition-all ${isActive('/analytics') ? 'text-blue-400 scale-110' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
        </Link>
        <Link to="/history" className={`flex flex-col items-center gap-1 transition-all ${isActive('/history') ? 'text-blue-400 scale-110' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">History</span>
        </Link>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let sid = localStorage.getItem('pca_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('pca_session_id', sid);
    }
    setSessionId(sid);
    setUser(dbService.getUser());

    const handleUpdate = () => setUser(dbService.getUser());
    window.addEventListener('storage', handleUpdate);
    return () => window.removeEventListener('storage', handleUpdate);
  }, []);

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative overflow-hidden pb-20 md:pb-0">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none clash-gradient"></div>
          <nav className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 glass sticky top-0 h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                  <span className="font-bold text-lg text-white">P</span>
                </div>
                <span className="text-xl font-display font-bold tracking-tight text-white">Arena</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/clash" className="text-sm font-medium text-gray-400 hover:text-white">Clash</Link>
                <Link to="/leaderboard" className="text-sm font-medium text-gray-400 hover:text-white">Leaderboard</Link>
                <Link to="/analytics" className="text-sm font-medium text-gray-400 hover:text-white">Stats</Link>
                <Link to="/history" className="text-sm font-medium text-gray-400 hover:text-white">History</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user && <UserHud user={user} onUpdate={(u) => setUser(u)} />}
            </div>
          </nav>

          <main className="flex-grow relative z-10 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/clash" element={<ClashPage sessionId={sessionId} />} />
              <Route path="/clash/:clashId" element={<ClashPage sessionId={sessionId} />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/personality/:id" element={<PersonalityDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<VoteHistory />} />
            </Routes>
          </main>
          {user && <AchievementNotifier user={user} />}
          <MobileBottomNav />
        </div>
      </Router>
    </ToastProvider>
  );
};

export default App;
