
import React, { useState, useEffect } from 'react';
import { Personality } from '../types';

interface PortraitCardProps {
  personality: Personality;
  onVote: (id: string) => void;
  selected?: boolean;
  disabled?: boolean;
  position: 'left' | 'right';
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop';

const PortraitCard: React.FC<PortraitCardProps> = ({ personality, onVote, selected, disabled, position }) => {
  const [loaded, setLoaded] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(personality.imageUrl);

  useEffect(() => {
    setLoaded(false);
    setCurrentImageUrl(personality.imageUrl);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
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
      {/* Cinematic Base Background */}
      <div className="absolute inset-0 bg-[#050505] z-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-40`} />
      </div>

      {/* Loading State Shimmer */}
      <div 
        className={`absolute inset-0 z-10 transition-opacity duration-700 ease-in-out pointer-events-none
          ${loaded ? 'opacity-0' : 'opacity-100'}
          animate-shimmer-sweep
        `}
      />

      {/* Photographic Portrait Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-no-repeat bg-center transition-all duration-[1500ms] cubic-bezier(0.23, 1, 0.32, 1) will-change-transform
          ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-2xl'}
          ${!disabled && !selected && loaded ? 'group-hover:scale-[1.03] group-hover:brightness-[1.05]' : ''}
          ${selected ? 'scale-110 saturate-[1.1] brightness-[1.1]' : 'brightness-[0.7]'}
        `}
        style={{ 
          backgroundImage: `url(${currentImageUrl})`,
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
      />

      {/* Deep Vignette for Text Readability */}
      <div className={`absolute inset-0 transition-opacity duration-500 z-20 ${selected ? 'bg-blue-600/10' : 'bg-gradient-to-t from-black via-black/40 to-transparent opacity-90'}`} />

      {/* Competitor Information */}
      <div className={`absolute bottom-0 left-0 w-full p-8 md:p-14 transition-all duration-700 z-30 pointer-events-none
        ${selected ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}
      `}>
        <div className="mb-2">
          <span className="text-[10px] md:text-[12px] font-black tracking-[0.5em] text-blue-400 uppercase opacity-80 mb-2 block">The Challenger</span>
          <h2 className={`text-4xl md:text-6xl lg:text-8xl font-display font-black text-white leading-tight drop-shadow-2xl uppercase transition-all duration-1000 delay-100 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {personality.name}
          </h2>
        </div>
        <p className={`text-gray-300 text-sm md:text-base max-w-lg transition-all duration-1000 delay-300 mt-4 leading-relaxed font-light drop-shadow-lg
          ${!disabled && loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}>
          {personality.description}
        </p>
      </div>
      
      {/* Victory Celebration Layer */}
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 bg-white z-[60] animate-flash" />
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-md animate-in fade-in duration-500 z-50" />
          
          <div className="relative flex flex-col items-center gap-8 text-white transform scale-100 animate-in zoom-in-95 duration-500 ease-out z-[55]">
            <div className="relative">
               <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full animate-pulse" />
               <div className="w-28 h-28 md:w-40 md:h-40 bg-white text-blue-700 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(255,255,255,0.6)] border-8 border-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 md:w-24 md:h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <div className="text-center px-6">
              <div className="font-display font-black text-4xl md:text-7xl tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] italic">Victory</div>
              <div className="text-[12px] md:text-sm font-black text-blue-100 uppercase tracking-[0.6em] mt-4 bg-black/40 px-8 py-2 rounded-full backdrop-blur-xl border border-white/10">
                Arena Choice Recorded
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortraitCard;
