export interface Child {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  maxXp: number;
  level: number;
  levelTitle?: string;
  streak: number;
  coins: number;
  lastActiveDate?: string;
  badges?: Badge[];
}

export interface Task {
  id: string;
  name: string;
  emoji: string;
  xp: number;
  coins: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration?: number;
  deadline?: string;
  assignedToId?: string;
  assignedTo?: { id: string; name: string; avatar: string };
  recurring?: string;
  isBonus: boolean;
  completions?: TaskCompletion[];
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  childId: string;
  completedAt: string;
}

export interface Reward {
  id: string;
  emoji: string;
  name: string;
  cost: number;
}

export interface Badge {
  type: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  level: number;
  levelTitle: string;
  xp: number;
  streak: number;
  coins: number;
  totalCompletions: number;
}
