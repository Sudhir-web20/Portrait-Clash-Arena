
import { Personality, Vote, Clash } from './types';

const STORAGE_KEY = 'portrait_clash_arena_db_v5';

const INITIAL_PERSONALITIES: Personality[] = [
  {
    id: '1',
    name: 'Steve Jobs',
    description: 'Visionary co-founder of Apple Inc. and pioneer of the personal computer and smartphone eras.',
    imageUrl: 'https://images.unsplash.com/photo-1550133730-695473e544be?q=80&w=800&auto=format&fit=crop',
    stats: { wins: 0, losses: 0, totalVotes: 0 }
  },
  {
    id: '2',
    name: 'Elon Musk',
    description: 'Business magnate and engineer, leading Tesla, SpaceX, and the pursuit of a multi-planetary future.',
    imageUrl: 'https://images.unsplash.com/photo-1563200742-0f04ca447b97?q=80&w=800&auto=format&fit=crop',
    stats: { wins: 0, losses: 0, totalVotes: 0 }
  },
  {
    id: '3',
    name: 'Marie Curie',
    description: 'Legendary physicist and chemist who conducted pioneering research on radioactivity.',
    imageUrl: 'https://images.unsplash.com/photo-1567113463300-102550123354?q=80&w=800&auto=format&fit=crop',
    stats: { wins: 0, losses: 0, totalVotes: 0 }
  },
  {
    id: '4',
    name: 'Albert Einstein',
    description: 'Theoretical physicist who developed the theory of relativity, one of the pillars of modern physics.',
    imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=800&auto=format&fit=crop',
    stats: { wins: 0, losses: 0, totalVotes: 0 }
  },
  {
    id: '5',
    name: 'Leonardo da Vinci',
    description: 'Polymath of the High Renaissance who was active as a painter, scientist, and engineer.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
    stats: { wins: 0, losses: 0, totalVotes: 0 }
  },
  {
    id: '6',
    name: 'Ada Lovelace',
    description: 'English mathematician and writer, chiefly known for her work on the Analytical Engine.',
    imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=800&auto=format&fit=crop',
    stats: { wins: 0, losses: 0, totalVotes: 0 }
  }
];

interface DB {
  personalities: Personality[];
  votes: Vote[];
  clashes: Clash[];
}

const getDB = (): DB => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initial: DB = {
      personalities: INITIAL_PERSONALITIES,
      votes: [],
      clashes: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event('storage'));
};

export const dbService = {
  getPersonalities: () => getDB().personalities,
  
  addPersonality: (p: Omit<Personality, 'id' | 'stats'>) => {
    const db = getDB();
    const newP: Personality = {
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      stats: { wins: 0, losses: 0, totalVotes: 0 }
    };
    db.personalities.push(newP);
    saveDB(db);
    return newP;
  },

  updatePersonality: (id: string, updates: Partial<Personality>) => {
    const db = getDB();
    db.personalities = db.personalities.map(p => p.id === id ? { ...p, ...updates } : p);
    saveDB(db);
  },

  deletePersonality: (id: string) => {
    const db = getDB();
    db.personalities = db.personalities.filter(p => p.id !== id);
    saveDB(db);
  },

  createClash: (idA: string, idB: string): Clash => {
    const db = getDB();
    const clash: Clash = {
      id: Math.random().toString(36).substr(2, 9),
      personalityAId: idA,
      personalityBId: idB,
      timestamp: Date.now()
    };
    db.clashes.push(clash);
    saveDB(db);
    return clash;
  },

  getClash: (id: string) => getDB().clashes.find(c => c.id === id),

  recordVote: (clashId: string, winnerId: string, sessionId: string) => {
    const db = getDB();
    const clash = db.clashes.find(c => c.id === clashId);
    if (!clash) return null;

    const existingVote = db.votes.find(v => v.clashId === clashId && v.sessionId === sessionId);
    if (existingVote) return { success: false, message: 'Already voted' };

    const loserId = clash.personalityAId === winnerId ? clash.personalityBId : clash.personalityAId;

    const vote: Vote = {
      id: Math.random().toString(36).substr(2, 9),
      clashId,
      winnerId,
      loserId,
      timestamp: Date.now(),
      sessionId
    };

    db.votes.push(vote);

    db.personalities = db.personalities.map(p => {
      if (p.id === winnerId) {
        return { ...p, stats: { ...p.stats, wins: p.stats.wins + 1, totalVotes: p.stats.totalVotes + 1 } };
      }
      if (p.id === loserId) {
        return { ...p, stats: { ...p.stats, losses: p.stats.losses + 1, totalVotes: p.stats.totalVotes + 1 } };
      }
      return p;
    });

    saveDB(db);
    return { success: true, vote };
  },

  getStats: () => {
    const db = getDB();
    return db.personalities.map(p => ({
      ...p,
      winRate: p.stats.totalVotes > 0 ? (p.stats.wins / p.stats.totalVotes) * 100 : 0
    })).sort((a, b) => b.winRate - a.winRate);
  },

  getRecentVotes: () => {
    const db = getDB();
    return [...db.votes].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }
};
