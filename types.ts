
export interface Personality {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  stats: {
    wins: number;
    losses: number;
    totalVotes: number;
  };
}

export interface Vote {
  id: string;
  clashId: string;
  winnerId: string;
  loserId: string;
  timestamp: number;
  sessionId: string;
}

export interface Clash {
  id: string;
  personalityAId: string;
  personalityBId: string;
  timestamp: number;
}
