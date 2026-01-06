
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../db';
import { Personality, Clash } from '../types';
import PortraitCard from '../components/PortraitCard';

interface ClashPageProps {
  sessionId: string;
}

const ClashPage: React.FC<ClashPageProps> = ({ sessionId }) => {
  const { clashId } = useParams<{ clashId?: string }>();
  const navigate = useNavigate();
  const [clash, setClash] = useState<Clash | null>(null);
  const [personA, setPersonA] = useState<Personality | null>(null);
  const [personB, setPersonB] = useState<Personality | null>(null);
  const [votedWinnerId, setVotedWinnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isProjectionMode, setIsProjectionMode] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const navTimeoutRef = useRef<number | null>(null);

  const getNextClashId = useCallback(() => {
    const personalities = dbService.getPersonalities();
    if (personalities.length < 2) return null;

    let shuffled = [...personalities].sort(() => 0.5 - Math.random());
    const a = shuffled[0];
    const b = shuffled[1];
    
    const newClash = dbService.createClash(a.id, b.id);
    
    // Warm up cache for smoother transitions
    const img1 = new Image(); img1.src = a.imageUrl;
    const img2 = new Image(); img2.src = b.imageUrl;
    
    return newClash.id;
  }, []);

  const loadRandomClash = useCallback(() => {
    if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current);
    const nextId = getNextClashId();
    if (nextId) {
      navigate(`/clash/${nextId}`, { replace: true });
    }
  }, [navigate, getNextClashId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!clashId) {
      loadRandomClash();
      return;
    }

    const fetchedClash = dbService.getClash(clashId);
    if (!fetchedClash) {
      loadRandomClash();
      return;
    }

    const personalities = dbService.getPersonalities();
    const a = personalities.find(p => p.id === fetchedClash.personalityAId);
    const b = personalities.find(p => p.id === fetchedClash.personalityBId);

    if (!a || !b) {
      loadRandomClash();
      return;
    }

    const recentVotes = dbService.getRecentVotes();
    const existingVote = recentVotes.find(v => v.clashId === clashId && v.sessionId === sessionId);

    setPersonA(a);
    setPersonB(b);
    setClash(fetchedClash);
    setLoading(false);
    setVotedWinnerId(existingVote ? existingVote.winnerId : null);
  }, [clashId, loadRandomClash, sessionId]);

  const handleVote = (winnerId: string) => {
    if (votedWinnerId || !clash) {
      triggerToast();
      return;
    }

    const result = dbService.recordVote(clash.id, winnerId, sessionId);
    if (!result?.success) {
      triggerToast();
      return;
    }

    setVotedWinnerId(winnerId);
    
    if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = window.setTimeout(() => {
      loadRandomClash();
    }, 1500); // Slightly longer for "Arena feel"
  };

  const triggerToast = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setShowToast(true);
    timerRef.current = window.setTimeout(() => setShowToast(false), 3000);
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}#/clash/${clashId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}`;

  if (loading || !personA || !personB) {
    return (
      <div className="flex-grow flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`flex-grow flex flex-col relative h-[calc(100vh-64px)] overflow-hidden bg-black select-none transition-all duration-1000 ${isProjectionMode ? 'brightness-[1.1] saturate-[1.1]' : ''}`}>
      <div className="flex-grow flex flex-col md:flex-row items-stretch relative bg-[#050505] overflow-hidden">
        
        {/* Left Competitor */}
        <div className={`flex-1 relative overflow-hidden transition-all duration-1000 ${isProjectionMode ? 'md:flex-[0.8]' : ''}`}>
          <PortraitCard 
            personality={personA} 
            onVote={handleVote} 
            selected={votedWinnerId === personA.id} 
            disabled={votedWinnerId !== null}
            position="left"
          />
        </div>
        
        {/* The VS Hub (Animated for TV) */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none hidden md:block transition-all duration-1000 ${isProjectionMode ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse rounded-full"></div>
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full glass border-2 border-white/10 flex items-center justify-center backdrop-blur-3xl animate-vs-glow">
              <span className="text-3xl lg:text-5xl font-display font-black text-white italic tracking-tighter">VS</span>
            </div>
          </div>
        </div>

        {/* Right Competitor */}
        <div className={`flex-1 relative overflow-hidden transition-all duration-1000 ${isProjectionMode ? 'md:flex-[0.8]' : ''}`}>
          <PortraitCard 
            personality={personB} 
            onVote={handleVote} 
            selected={votedWinnerId === personB.id} 
            disabled={votedWinnerId !== null}
            position="right"
          />
        </div>

        {/* PROJECTION MODE OVERLAY */}
        <div className={`absolute inset-0 z-[60] pointer-events-none flex items-center justify-center transition-all duration-1000 ${isProjectionMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className={`glass p-12 rounded-[4rem] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col items-center text-center transition-transform duration-1000 ${isProjectionMode ? 'scale-100 pointer-events-auto' : 'scale-50'}`}>
             <div className="absolute -top-6 bg-blue-600 text-white px-8 py-2 rounded-full font-black uppercase tracking-[0.3em] text-sm shadow-xl animate-pulse">
               Arena Access
             </div>
             
             <div className="relative group mb-8">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000 animate-vs-glow"></div>
              <div className="relative bg-white p-4 rounded-[2rem]">
                <img src={qrCodeUrl} alt="Big QR Code" className="w-64 h-64 lg:w-80 lg:h-80" />
              </div>
            </div>

            <h4 className="text-white font-display font-black text-4xl lg:text-6xl leading-tight uppercase tracking-tighter italic">Join The Battle</h4>
            <p className="text-sm lg:text-xl text-blue-400 mt-4 uppercase font-black tracking-[0.4em] leading-relaxed opacity-80">Scan with your phone to cast your vote</p>
            
            <div className="mt-8 flex gap-4">
               <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Sync Enabled</span>
               </div>
            </div>
          </div>
        </div>

        {/* Compact Static QR (Hidden in projection mode) */}
        {!isProjectionMode && (
          <div className="absolute bottom-10 right-10 z-[60] hidden xl:flex flex-col gap-4 max-w-[200px] animate-in slide-in-from-right duration-700 delay-500">
            <div className="glass p-5 rounded-[2rem] border-white/10 shadow-2xl flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-white p-2 rounded-2xl">
                  <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                </div>
              </div>
              <h4 className="text-white font-display font-bold text-lg leading-tight uppercase tracking-tight">Join Arena</h4>
              <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-widest leading-relaxed">Scan to Vote</p>
            </div>
          </div>
        )}
      </div>

      {/* Global Interactive Footer */}
      <div className={`glass border-t border-white/5 py-4 px-6 md:px-12 flex items-center justify-between gap-4 z-[70] min-h-[80px] transition-all duration-700 ${isProjectionMode ? 'bg-black/80 backdrop-blur-3xl' : ''}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
             <div>
              <h3 className="text-sm font-display font-black text-white tracking-tight uppercase">Live Arena Battle</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-bold">Waiting for remote signals...</p>
             </div>
          </div>
          
          <button 
            onClick={() => setIsProjectionMode(!isProjectionMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest
              ${isProjectionMode 
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {isProjectionMode ? 'Exit Projection' : 'Projection Mode'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={loadRandomClash}
            className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 transition-all py-2.5 px-6 rounded-2xl"
          >
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Next Battle</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toast Overlay */}
      <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none
        ${showToast ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'}
      `}>
        <div className="glass border-2 border-blue-500/20 text-white px-10 py-5 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] flex flex-col items-center gap-1">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Battle Alert</span>
          <span className="text-sm font-bold tracking-tight text-white/90">Your vote has already been cast for this matchup.</span>
        </div>
      </div>
    </div>
  );
};

export default ClashPage;
