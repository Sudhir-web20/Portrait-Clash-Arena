
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbService } from '../db';
import { Personality, Clash, Vote } from '../types';
import PortraitCard from '../components/PortraitCard';
import { useToast } from '../components/Toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useSwipe } from '../hooks/useSwipe';
import { audioService } from '../services/audio';

interface ClashPageProps {
  sessionId: string;
}

const ClashPage: React.FC<ClashPageProps> = ({ sessionId }) => {
  const { clashId } = useParams<{ clashId?: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [clash, setClash] = useState<Clash | null>(null);
  const [personA, setPersonA] = useState<Personality | null>(null);
  const [personB, setPersonB] = useState<Personality | null>(null);
  const [votedWinnerId, setVotedWinnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProjectionMode, setIsProjectionMode] = useState(false);
  const [showResultCard, setShowResultCard] = useState(false);
  const [clashStats, setClashStats] = useState({ winnerPct: 50, loserPct: 50 });
  const [lastVoteId, setLastVoteId] = useState<string | null>(null);
  const [undoTimer, setUndoTimer] = useState(0);

  const navTimeoutRef = useRef<number | null>(null);

  const getNextClashId = useCallback(() => {
    const personalities = dbService.getPersonalities();
    if (personalities.length < 2) return null;
    return dbService.createClash().id;
  }, []);

  const loadRandomClash = useCallback(() => {
    if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current);
    const nextId = getNextClashId();
    if (nextId) {
      setShowResultCard(false);
      setVotedWinnerId(null);
      setLastVoteId(null);
      navigate(`/clash/${nextId}`, { replace: true });
    }
  }, [navigate, getNextClashId]);

  const { onTouchStart, onTouchMove, onTouchEnd, swipeState } = useSwipe(
    () => personB && handleVote(personB.id), // Swipe Left -> Select Right
    () => personA && handleVote(personA.id)  // Swipe Right -> Select Left
  );

  useKeyboardShortcuts([
    { key: 'ArrowLeft', action: () => personA && handleVote(personA.id) },
    { key: 'ArrowRight', action: () => personB && handleVote(personB.id) },
    { key: 'n', action: loadRandomClash },
  ]);

  useEffect(() => {
    if (!clashId) { loadRandomClash(); return; }
    const fetchedClash = dbService.getClash(clashId);
    if (!fetchedClash) { loadRandomClash(); return; }
    const personalities = dbService.getPersonalities();
    const a = personalities.find(p => p.id === fetchedClash.personalityAId);
    const b = personalities.find(p => p.id === fetchedClash.personalityBId);
    if (!a || !b) { loadRandomClash(); return; }

    const recentVotes = dbService.getRecentVotes();
    const existingVote = recentVotes.find(v => v.clashId === clashId && v.sessionId === sessionId);

    setPersonA(a); setPersonB(b); setClash(fetchedClash); setLoading(false);
    if (existingVote) {
      setVotedWinnerId(existingVote.winnerId);
      calculateClashStats(clashId, existingVote.winnerId);
      setShowResultCard(true);
    } else {
      setVotedWinnerId(null);
      setShowResultCard(false);
    }
  }, [clashId, loadRandomClash, sessionId]);

  useEffect(() => {
    if (undoTimer > 0) {
      const t = setTimeout(() => setUndoTimer(undoTimer - 1), 1000);
      return () => clearTimeout(t);
    } else if (lastVoteId) {
      setLastVoteId(null);
    }
  }, [undoTimer, lastVoteId]);

  const calculateClashStats = (cId: string, winnerId: string) => {
    const allVotes = dbService.getRecentVotes().filter(v => v.clashId === cId);
    if (allVotes.length === 0) return;
    const winnerVotes = allVotes.filter(v => v.winnerId === winnerId).length;
    const winnerPct = Math.round((winnerVotes / allVotes.length) * 100);
    setClashStats({ winnerPct, loserPct: 100 - winnerPct });
  };

  const handleVote = (winnerId: string) => {
    if (votedWinnerId || !clash) return;
    audioService.play('vote');
    const result = dbService.recordVote(clash.id, winnerId, sessionId);
    if (result && !result.success) {
      showToast(result.message, 'warning');
      return;
    }
    setVotedWinnerId(winnerId);
    setLastVoteId(result!.vote.id);
    setUndoTimer(5);
    calculateClashStats(clash.id, winnerId);
    showToast(`Strike Confirmed! +${result?.influenceGained} INF`, 'success');
    setTimeout(() => { audioService.play('victory'); setShowResultCard(true); }, 1500);
  };

  const handleUndo = () => {
    if (lastVoteId && dbService.undoVote(lastVoteId)) {
      setVotedWinnerId(null);
      setLastVoteId(null);
      setUndoTimer(0);
      setShowResultCard(false);
      showToast('Arena Strike Retracted', 'info');
    }
  };

  if (loading || !personA || !personB) return <div className="flex-grow flex items-center justify-center bg-black"><div className="w-12 h-12 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin"></div></div>;

  // Visual feedback for swipe
  const leanRight = swipeState.deltaX > 20;
  const leanLeft = swipeState.deltaX < -20;
  const swipeOpacity = Math.min(0.4, Math.abs(swipeState.deltaX) / 300);

  return (
    <div 
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`flex-grow flex flex-col relative h-[calc(100vh-144px)] md:h-[calc(100vh-64px)] overflow-hidden bg-black select-none transition-all duration-1000 clash-container ${isProjectionMode ? 'brightness-[1.1] saturate-[1.1]' : ''}`}
    >
      <div className="flex-grow flex flex-col md:flex-row items-stretch relative bg-[#050505] overflow-hidden">
        
        {/* Left Competitor Overlay Interaction */}
        <div 
          className="flex-1 relative overflow-hidden h-1/2 md:h-full transition-all duration-300"
          style={{ 
            opacity: leanRight ? 1 - swipeOpacity : 1,
            transform: leanLeft ? `scale(${1 + swipeOpacity * 0.1})` : 'scale(1)'
          }}
        >
          <PortraitCard personality={personA} onVote={handleVote} selected={votedWinnerId === personA.id} disabled={votedWinnerId !== null} position="left" />
        </div>
        
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all ${isProjectionMode ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
          <div className={`w-16 h-16 md:w-32 md:h-32 rounded-full glass border-2 border-white/10 flex items-center justify-center backdrop-blur-3xl animate-vs-glow shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-transform ${leanLeft ? '-translate-x-4' : leanRight ? 'translate-x-4' : ''}`}>
            <span className="text-xl md:text-3xl font-display font-black text-white italic">VS</span>
          </div>
        </div>
        
        {/* Right Competitor Overlay Interaction */}
        <div 
          className="flex-1 relative overflow-hidden h-1/2 md:h-full transition-all duration-300"
          style={{ 
            opacity: leanLeft ? 1 - swipeOpacity : 1,
            transform: leanRight ? `scale(${1 + swipeOpacity * 0.1})` : 'scale(1)'
          }}
        >
          <PortraitCard personality={personB} onVote={handleVote} selected={votedWinnerId === personB.id} disabled={votedWinnerId !== null} position="right" />
        </div>

        {/* Swipe Hint Overlay for Mobile */}
        {swipeState.isSwiping && Math.abs(swipeState.deltaX) > 50 && (
          <div className="absolute inset-0 z-[60] pointer-events-none flex items-center justify-center px-4">
            <div className={`px-6 md:px-10 py-4 glass rounded-full border-2 transition-all duration-200 ${leanLeft ? 'border-blue-500/50 bg-blue-500/20 -translate-x-6' : 'border-purple-500/50 bg-purple-500/20 translate-x-6'}`}>
              <span className="text-white font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">
                {leanLeft ? `Vote ${personA.name}` : `Vote ${personB.name}`}
              </span>
            </div>
          </div>
        )}

        {lastVoteId && undoTimer > 0 && !showResultCard && (
          <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-4">
            <button onClick={handleUndo} className="glass px-8 py-3 rounded-full border border-yellow-500/30 text-yellow-400 font-black text-xs uppercase tracking-widest hover:bg-yellow-500/10 transition-all flex items-center gap-2 active:scale-95">
              <span className="w-4 h-4 rounded-full border border-yellow-500/50 flex items-center justify-center text-[8px]">{undoTimer}</span> Undo Strike
            </button>
          </div>
        )}

        {showResultCard && votedWinnerId && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="glass max-w-lg w-full rounded-[2.5rem] overflow-hidden border-blue-500/30 shadow-2xl animate-in zoom-in-95 duration-700">
              <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-2 block">Matchup Stats</span>
                   <h3 className="text-2xl md:text-3xl font-display font-black text-white italic">{clashStats.winnerPct}% Approval</h3>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden flex border border-white/5 p-1">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000" style={{ width: `${clashStats.winnerPct}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Voted for ${votedWinnerId === personA.id ? personA.name : personB.name} in Arena!`)}`)} className="bg-black border border-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Share on X</button>
                  <button onClick={loadRandomClash} className="bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-transform">Next Battle</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClashPage;
