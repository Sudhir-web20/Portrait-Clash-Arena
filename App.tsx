
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ClashPage from './pages/Clash';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

const App: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let sid = localStorage.getItem('pca_session_id');
    if (!sid) {
      sid = 'session_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('pca_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none clash-gradient"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>

        {/* Global Navigation */}
        <nav className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 glass sticky top-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-display font-bold tracking-tight text-white">Portrait Clash</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/clash" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Clash</Link>
            <Link to="/leaderboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
            <Link to="/admin" className="text-xs font-mono py-1 px-2 rounded border border-white/10 text-gray-500 hover:text-blue-400 hover:border-blue-400/30 transition-all">Admin</Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-grow relative z-10 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clash" element={<ClashPage sessionId={sessionId} />} />
            <Route path="/clash/:clashId" element={<ClashPage sessionId={sessionId} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <footer className="relative z-50 py-8 px-6 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© 2024 Portrait Clash Arena. Experience the ultimate face-off.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
