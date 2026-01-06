
import { Personality, Vote, Clash, RankTier, UserProfile, Achievement } from './types';

const STORAGE_KEY = 'portrait_clash_arena_db_v11';
const USER_KEY = 'pca_user_profile';
const K_FACTOR = 32;

const getRankTier = (elo: number): RankTier => {
  if (elo >= 1800) return 'Challenger';
  if (elo >= 1600) return 'Diamond';
  if (elo >= 1400) return 'Platinum';
  if (elo >= 1200) return 'Gold';
  if (elo >= 1000) return 'Silver';
  return 'Bronze';
};

const INITIAL_PERSONALITIES = [
  { 
    name: 'The Tech Visionary', 
    description: 'A revolutionary mind who transformed how humanity interacts with technology.', 
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop' 
  },
  { 
    name: 'The Rocket Engineer', 
    description: 'A pioneer pushing the boundaries of interplanetary travel and clean energy.', 
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1000&auto=format&fit=crop' 
  },
  { 
    name: 'The Atomic Scientist', 
    description: 'Pioneering researcher on radioactivity who changed the face of physics.', 
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop' 
  },
  { 
    name: 'The Theoretical Mind', 
    description: 'Developer of the laws that govern the universe and the structure of time.', 
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop' 
  },
  { 
    name: 'The Polymath Genius', 
    description: 'Renaissance individual whose mastery spanned from art to engineering.', 
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop' 
  },
  { 
    name: 'The Original Coder', 
    description: 'The mathematical architect who wrote the first sequences of machine logic.', 
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop' 
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
      personalities: INITIAL_PERSONALITIES.map(p => ({
        ...p,
        id: Math.random().toString(36).substr(2, 9),
        elo: 1200,
        streak: 0,
        rankTier: 'Gold',
        stats: { wins: 0, losses: 0, totalVotes: 0 },
        history: [{ timestamp: Date.now(), elo: 1200 }]
      })),
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
  
  getUser: (): UserProfile => {
    const data = localStorage.getItem(USER_KEY);
    if (!data) {
      const newUser: UserProfile = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        username: 'New_Clasher_' + Math.floor(Math.random() * 999),
        avatar: '⚡',
        influence: 100,
        voteCount: 0,
        lastVoteTimestamp: 0,
        unlockedAchievements: [],
        history: []
      };
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      return newUser;
    }
    return JSON.parse(data);
  },

  updateUser: (updates: Partial<UserProfile>) => {
    const user = dbService.getUser();
    const updated = { ...user, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  addPersonality: (p: any) => {
    const db = getDB();
    const newP: Personality = {
      ...p,
      id: Math.random().toString(36).substr(2, 9),
      elo: 1200,
      streak: 0,
      rankTier: 'Gold',
      stats: { wins: 0, losses: 0, totalVotes: 0 },
      history: [{ timestamp: Date.now(), elo: 1200 }]
    };
    db.personalities.push(newP);
    saveDB(db);
    return newP;
  },

  deletePersonality: (id: string) => {
    const db = getDB();
    db.personalities = db.personalities.filter(p => p.id !== id);
    saveDB(db);
  },

  createClash: (idA?: string, idB?: string): Clash => {
    const db = getDB();
    const personalities = db.personalities;
    let a, b;
    
    if (idA && idB) {
      a = personalities.find(p => p.id === idA)!;
      b = personalities.find(p => p.id === idB)!;
    } else {
      a = personalities[Math.floor(Math.random() * personalities.length)];
      const pool = personalities.filter(p => p.id !== a.id);
      b = pool[Math.floor(Math.random() * pool.length)];
    }

    const clash: Clash = {
      id: Math.random().toString(36).substr(2, 9),
      personalityAId: a.id,
      personalityBId: b.id,
      timestamp: Date.now()
    };
    db.clashes.push(clash);
    saveDB(db);
    return clash;
  },

  getClash: (id: string) => getDB().clashes.find(c => c.id === id),

  recordVote: (clashId: string, winnerId: string, sessionId: string) => {
    const user = dbService.getUser();
    const now = Date.now();
    const db = getDB();
    const clash = db.clashes.find(c => c.id === clashId);
    if (!clash) return null;

    const existingVote = db.votes.find(v => v.clashId === clashId && v.sessionId === sessionId);
    if (existingVote) return { success: false, message: 'ALREADY_VOTED' };

    const loserId = clash.personalityAId === winnerId ? clash.personalityBId : clash.personalityAId;
    const winner = db.personalities.find(p => p.id === winnerId)!;
    const loser = db.personalities.find(p => p.id === loserId)!;

    const expectedA = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
    const eloChange = Math.round(K_FACTOR * (1 - expectedA));
    const influenceGained = Math.round(10 * (1 + (loser.elo - winner.elo) / 200));

    const vote: Vote = {
      id: Math.random().toString(36).substr(2, 9),
      clashId,
      winnerId,
      loserId,
      winnerEloBefore: winner.elo,
      winnerEloAfter: winner.elo + eloChange,
      loserEloBefore: loser.elo,
      loserEloAfter: Math.max(800, loser.elo - eloChange),
      timestamp: now,
      sessionId,
      userId: user.id,
      influenceGained,
      canUndo: true,
      undoDeadline: now + 5000
    };

    db.votes.push(vote);
    db.personalities = db.personalities.map(p => {
      if (p.id === winnerId) {
        const newElo = vote.winnerEloAfter;
        return { 
          ...p, elo: newElo, streak: p.streak < 0 ? 1 : p.streak + 1, rankTier: getRankTier(newElo),
          stats: { ...p.stats, wins: p.stats.wins + 1, totalVotes: p.stats.totalVotes + 1 },
          history: [...p.history, { timestamp: now, elo: newElo }].slice(-50)
        };
      }
      if (p.id === loserId) {
        const newElo = vote.loserEloAfter;
        return { 
          ...p, elo: newElo, streak: p.streak > 0 ? -1 : p.streak - 1, rankTier: getRankTier(newElo),
          stats: { ...p.stats, losses: p.stats.losses + 1, totalVotes: p.stats.totalVotes + 1 },
          history: [...p.history, { timestamp: now, elo: newElo }].slice(-50)
        };
      }
      return p;
    });

    saveDB(db);
    dbService.updateUser({ 
      voteCount: user.voteCount + 1, 
      influence: user.influence + influenceGained,
      lastVoteTimestamp: now,
      history: [...user.history, vote.id]
    });

    return { success: true, vote, influenceGained };
  },

  undoVote: (voteId: string) => {
    const db = getDB();
    const vote = db.votes.find(v => v.id === voteId);
    if (!vote || !vote.canUndo || Date.now() > (vote.undoDeadline || 0)) return false;

    db.votes = db.votes.filter(v => v.id !== voteId);
    db.personalities = db.personalities.map(p => {
      if (p.id === vote.winnerId) {
        return { 
          ...p, elo: vote.winnerEloBefore, streak: 0, rankTier: getRankTier(vote.winnerEloBefore),
          stats: { ...p.stats, wins: p.stats.wins - 1, totalVotes: p.stats.totalVotes - 1 },
          history: p.history.slice(0, -1)
        };
      }
      if (p.id === vote.loserId) {
        return { 
          ...p, elo: vote.loserEloBefore, streak: 0, rankTier: getRankTier(vote.loserEloBefore),
          stats: { ...p.stats, losses: p.stats.losses - 1, totalVotes: p.stats.totalVotes - 1 },
          history: p.history.slice(0, -1)
        };
      }
      return p;
    });

    saveDB(db);
    const user = dbService.getUser();
    dbService.updateUser({
      voteCount: Math.max(0, user.voteCount - 1),
      influence: Math.max(0, user.influence - (vote.influenceGained || 0)),
      history: user.history.filter(id => id !== voteId)
    });
    return true;
  },

  getStats: () => getDB().personalities.sort((a, b) => b.elo - a.elo),
  getRecentVotes: () => getDB().votes.slice(-500).reverse(),
  getAnalytics: () => {
    const db = getDB();
    const uniqueVoters = new Set(db.votes.map(v => v.sessionId)).size;
    const votesByHour = db.votes.reduce((acc, v) => {
      const h = new Date(v.timestamp).getHours();
      acc[h] = (acc[h] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    return {
      totalVotes: db.votes.length,
      totalClashes: db.clashes.length,
      uniqueVoters,
      votesByHour
    };
  }
};
