import React, { useState } from 'react';
import { UserProfile } from '../types';
import { dbService } from '../db';

interface UserHudProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const UserHud: React.FC<UserHudProps> = ({ user, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempName, setTempName] = useState(user.username);

  const handleSave = () => {
    const updated = dbService.updateUser({ username: tempName });
    onUpdate(updated);
    setIsOpen(false);
  };

  const avatars = ['⚡', '🔥', '🛡️', '👑', '🌌', '🚀', '🔮'];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full pl-2 pr-4 py-1.5 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
          {user.avatar}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[11px] font-black text-white leading-none uppercase tracking-tighter">{user.username}</div>
          <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">{user.influence} Infl.</div>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-4 w-72 glass p-6 rounded-3xl z-[70] shadow-2xl border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">Your Profile</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">Clasher Handle</label>
                <input 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase">Arena Crest</label>
                <div className="flex flex-wrap gap-2">
                  {avatars.map(a => (
                    <button 
                      key={a}
                      onClick={() => {
                        const updated = dbService.updateUser({ avatar: a });
                        onUpdate(updated);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all
                        ${user.avatar === a ? 'bg-blue-600 border-blue-400 scale-110' : 'bg-white/5 border border-white/10 hover:bg-white/10'}
                      `}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-gray-500 uppercase">Battles Cast</div>
                  <div className="text-xl font-black text-white">{user.voteCount}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-gray-500 uppercase">Influence</div>
                  <div className="text-xl font-black text-blue-400">{user.influence}</div>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                Save Changes
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserHud;