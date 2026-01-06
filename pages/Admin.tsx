
import React, { useState, useEffect } from 'react';
import { dbService } from '../db';
import { Personality } from '../types';
import { generateAIPortrait } from '../services/gemini';
import { useToast } from '../components/Toast';

const Admin: React.FC = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { showToast } = useToast();
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    setPersonalities(dbService.getPersonalities());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'arena123') {
      setIsAuthorized(true);
    } else {
      alert('Invalid Arena Key');
    }
  };

  const handleAIQuery = async () => {
    if (!name || !description) {
      showToast("Need name and bio first!", "warning");
      return;
    }

    setIsGenerating(true);
    showToast("Invoking Gemini AI...", "info");
    
    try {
      // Use archetypal descriptions to avoid direct celebrity likeness in prompts
      const archetypePrompt = `A ${description.slice(0, 50)} character type, high-end editorial headshot`;
      const base64Image = await generateAIPortrait(archetypePrompt);
      if (base64Image) {
        setImageUrl(base64Image);
        showToast("Portrait Manifested", "success");
      }
    } catch (err) {
      showToast("AI Request Failed", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !imageUrl) return;
    
    dbService.addPersonality({ name, description, imageUrl });
    setPersonalities(dbService.getPersonalities());
    setName('');
    setDescription('');
    setImageUrl('');
    showToast("Challenger Added", "success");
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      dbService.deletePersonality(id);
      setPersonalities(dbService.getPersonalities());
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex-grow flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="glass p-12 rounded-3xl w-full max-w-md space-y-6 text-center">
          <h2 className="text-3xl font-display font-black text-white">Arena Commander</h2>
          <p className="text-gray-500 text-sm">Enter your secret key to manage participants.</p>
          <div className="space-y-4 text-left">
            <div className="flex flex-col gap-2">
              <label htmlFor="arena-key" className="text-xs font-bold text-gray-500 uppercase px-1">Security Key</label>
              <input 
                id="arena-key"
                name="arena-key"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Key (hint: arena123)"
                autoComplete="current-password"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-6 py-12 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-white">Manage Participants</h1>
          <p className="text-gray-500">Add or remove personalities from the voting pool.</p>
        </div>
        <button 
          onClick={() => setIsAuthorized(false)}
          className="px-6 py-2 border border-white/10 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="glass p-8 rounded-3xl space-y-6 sticky top-24">
            <h3 className="text-xl font-bold text-white mb-4">Add New Personality</h3>
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Full Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. The Visionary"
                  required
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase px-1">Bio / Archetype</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-24 resize-none text-sm"
                  placeholder="A tech leader in a black turtleneck..."
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Portrait</label>
                  <button 
                    type="button"
                    onClick={handleAIQuery}
                    disabled={isGenerating}
                    className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1 hover:text-blue-300 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? 'Manifesting...' : '✨ AI Magic'}
                  </button>
                </div>
                <div className="relative aspect-square w-full rounded-2xl bg-black/50 border border-white/10 overflow-hidden flex items-center justify-center">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-600 text-[10px] font-bold uppercase italic">No Image</span>
                  )}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <input 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-gray-400 focus:outline-none"
                  placeholder="Or paste URL manually..."
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isGenerating || !imageUrl}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              Add to Arena
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-white">Current Participants ({personalities.length})</h3>
          </div>
          <div className="space-y-3">
            {personalities.map(p => (
              <div key={p.id} className="glass p-4 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-all">
                <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-white/10 shrink-0 bg-black">
                   <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{p.description}</p>
                </div>
                <div className="text-right px-4 hidden sm:block">
                  <div className="text-sm font-bold text-white">{p.stats.wins}W / {p.stats.losses}L</div>
                  <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Global Stats</div>
                </div>
                <button 
                  onClick={() => handleDelete(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
