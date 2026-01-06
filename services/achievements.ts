import { Achievement, UserProfile } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_vote', title: 'Arena Entry', description: 'Cast your very first vote.', icon: '🎯', rarity: 'common', points: 10 },
  { id: 'streak_3', title: 'Triple Threat', description: 'Vote 3 times in one session.', icon: '🔥', rarity: 'common', points: 25 },
  { id: 'influence_500', title: 'Influencer', description: 'Reach 500 global influence.', icon: '🛡️', rarity: 'rare', points: 50 },
  { id: 'collector', title: 'Arena Historian', description: 'Vote on all current participants.', icon: '💎', rarity: 'epic', points: 100 },
];

export const checkAchievements = (user: UserProfile, votes: any[]): Achievement[] => {
  const newlyUnlocked: Achievement[] = [];
  const unlockedIds = new Set(user.unlockedAchievements);

  if (!unlockedIds.has('first_vote') && user.voteCount >= 1) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'first_vote')!);
  }
  if (!unlockedIds.has('streak_3') && user.voteCount >= 3) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'streak_3')!);
  }
  if (!unlockedIds.has('influence_500') && user.influence >= 500) {
    newlyUnlocked.push(ACHIEVEMENTS.find(a => a.id === 'influence_500')!);
  }

  return newlyUnlocked;
};
