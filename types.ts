export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Challenger';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  influence: number;
  voteCount: number;
  lastVoteTimestamp: number;
  unlockedAchievements: string[];
  history: string[]; // IDs of votes
}

export interface Personality {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  elo: number;
  streak: number;
  rankTier: RankTier;
  stats: {
    wins: number;
    losses: number;
    totalVotes: number;
  };
  history: {
    timestamp: number;
    elo: number;
  }[];
}

export interface Vote {
  id: string;
  clashId: string;
  winnerId: string;
  loserId: string;
  winnerEloBefore: number;
  winnerEloAfter: number;
  loserEloBefore: number;
  loserEloAfter: number;
  timestamp: number;
  sessionId: string;
  userId?: string;
  influenceGained?: number;
  canUndo?: boolean;
  undoDeadline?: number;
}

export interface Clash {
  id: string;
  personalityAId: string;
  personalityBId: string;
  timestamp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}
