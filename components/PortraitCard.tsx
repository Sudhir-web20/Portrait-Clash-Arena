
import React, { useState, useEffect } from 'react';
import { Personality } from '../types';

interface PortraitCardProps {
  personality: Personality;
  onVote: (id: string) => void;
  selected?: boolean;
  disabled?: boolean;
  position: 'left' | 'right';
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';

const PortraitCard: React.FC<PortraitCardProps> = ({ personality, onVote, selected, disabled, position }) => {
  const [loaded, setLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(personality.imageUrl);

  useEffect(() => {
    setLoaded(false);
    setCurrentImageUrl(personality.imageUrl);
    
    const img = new Image();
    img.src = personality.imageUrl;
    
    img.onload = () => setLoaded(true);
    img.onerror = () => {
      setCurrentImageUrl(FALLBACK_IMAGE);
      setLoaded(true);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [personality.imageUrl]);

  return (
    <div 
      onClick={() => onVote(personality.id)}
      className={`group relative flex-1 h-full overflow-hidden transition-all duration-300 cursor-pointer
        ${disabled ? 'cursor-default' : 'active:scale-[0.99]'}
        ${selected ? 'z-10 ring-4 ring-blue-500 ring-inset animate-impact' : ''}
        will-change-transform
      `}
    >
      <div className="absolute inset-0 bg-[#050505] z-0" />

      <div 
        className={`absolute inset-0 z-10 transition-opacity duration-700 ease-in-out pointer-events-none
          ${loaded ? 'opacity-0' : 'opacity-100'}
          animate-shimmer-sweep
        `}
      />

      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-[1200ms] cubic-bezier(0.23, 1, 0.32, 1) will-change-transform
          ${loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-110 blur-xl'}
          ${!disabled && !selected && loaded ? 'group-hover:scale-[1.03] group-hover:brightness-[0.8]' : ''}
          ${selected ? 'scale-110 saturate-[1.2] brightness-125' : 'brightness-[0.6]'}
        `}
        style={{ 
          backgroundImage: `url(${currentImageUrl})`,
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
      />

      <div className={`absolute inset-0 transition-opacity duration-300 z-20 ${selected ? 'bg-blue-600/20' : 'bg-gradient-to-b from-black/20 via-transparent to-black/95 opacity-100'}`} />

      <div className={`absolute bottom-0 left-0 w-full p-6 md:p-12 transition-all duration-500 z-30 pointer-events-none
        ${selected ? 'translate-y-0 opacity-100' : 'translate-y-1 group-hover:translate-y-0'}
      `}>
        <div className="mb-1">
          <span className="text-[9px] md:text-[11px] font-bold tracking-[0.4em] text-blue-400 uppercase opacity-70 mb-1 block">The Challenger</span>
          <h2 className={`text-2xl md:text-5xl lg:text-7xl font-display font-black text-white leading-[0.9] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] uppercase transition-all duration-1000 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {personality.name}
          </h2>
        </div>
        {!selected && (
          <p className={`text-gray-300 text-xs md:text-sm max-w-sm transition-all duration-1000 delay-200 mt-3 line-clamp-2
            ${!disabled && loaded ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            {personality.description}
          </p>
        )}
      </div>
      
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 bg-white z-[60] animate-flash" />
          <div className="absolute inset-0 bg-blue-600/30 backdrop-blur-md animate-in fade-in duration-300 z-50" />
          <div className="absolute w-80 h-80 border-4 border-white/30 rounded-full animate-victory-pulse z-50"></div>
          
          <div className="relative flex flex-col items-center gap-6 text-white transform scale-100 animate-in zoom-in-90 duration-300 ease-out z-[55]">
            <div className="relative">
               <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full animate-pulse" />
               <div className="w-24 h-24 md:w-32 md:h-32 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 md:w-20 md:h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-display font-black text-3xl md:text-5xl tracking-tighter uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] italic">Confirmed</div>
              <div className="text-[10px] md:text-xs font-black text-blue-200 uppercase tracking-[0.5em] mt-2 opacity-100 bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
                Arena Vote Recorded
              </div>
            </div>
          </div>
        </div>
      )}
      
      {selected && (
        <div className="absolute inset-0 border-[8px] border-white/20 pointer-events-none z-40" />
      )}
    </div>
  );
};

export default PortraitCard;
