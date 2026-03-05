import { prisma } from './prisma';

const LEVEL_TITLES = ['Beginner', 'Helper', 'Taakster', 'Held', 'Superster', 'Kampioen', 'Legende'];
const BASE_XP = 100;
const SCALE_FACTOR = 1.4;

export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(SCALE_FACTOR, level - 2));
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || 'Legende';
}

export async function addXpToChild(childId: string, xpGain: number, coinsGain: number) {
  const child = await prisma.child.findUniqueOrThrow({ where: { id: childId } });

  let newXp = child.xp + xpGain;
  let newLevel = child.level;
  let newMaxXp = child.maxXp;

  // Level up loop
  while (newXp >= newMaxXp && newLevel < LEVEL_TITLES.length) {
    newXp -= newMaxXp;
    newLevel++;
    newMaxXp = getXpForLevel(newLevel + 1);
  }

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActive = child.lastActiveDate ? new Date(child.lastActiveDate) : null;
  lastActive?.setHours(0, 0, 0, 0);

  let newStreak = child.streak;
  if (!lastActive || lastActive.getTime() < today.getTime() - 86400000) {
    newStreak = 1; // Reset or start streak
  } else if (lastActive.getTime() < today.getTime()) {
    newStreak++; // Consecutive day
  }

  const updated = await prisma.child.update({
    where: { id: childId },
    data: {
      xp: newXp,
      level: newLevel,
      maxXp: newMaxXp,
      coins: child.coins + coinsGain,
      streak: newStreak,
      lastActiveDate: new Date(),
    },
  });

  // Check badges
  await checkBadges(childId, updated);

  return updated;
}

export async function removeXpFromChild(childId: string, xpLoss: number, coinsLoss: number) {
  const child = await prisma.child.findUniqueOrThrow({ where: { id: childId } });

  return prisma.child.update({
    where: { id: childId },
    data: {
      xp: Math.max(0, child.xp - xpLoss),
      coins: Math.max(0, child.coins - coinsLoss),
    },
  });
}

async function checkBadges(childId: string, child: any) {
  const badges: string[] = [];

  // First task
  const completionCount = await prisma.taskCompletion.count({ where: { childId } });
  if (completionCount >= 1) badges.push('first_task');

  // Streak master (7 days)
  if (child.streak >= 7) badges.push('streak_master');

  // Hard worker (10 hard tasks)
  const hardCount = await prisma.taskCompletion.count({
    where: {
      childId,
      task: { difficulty: 'hard' },
    },
  });
  if (hardCount >= 10) badges.push('hard_worker');

  // Speedster (5 tasks in one day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayCount = await prisma.taskCompletion.count({
    where: {
      childId,
      completedAt: { gte: today, lt: tomorrow },
    },
  });
  if (todayCount >= 5) badges.push('speedster');

  // Task thief (3 stolen tasks — tracked by completion of tasks assigned to others)
  const stolenCount = await prisma.taskCompletion.count({
    where: {
      childId,
      task: {
        assignedToId: { not: childId },
      },
    },
  });
  if (stolenCount >= 3) badges.push('task_thief');

  // Legend (level 7)
  if (child.level >= 7) badges.push('legend');

  // Upsert badges
  for (const badgeType of badges) {
    await prisma.badge.upsert({
      where: { childId_badgeType: { childId, badgeType } },
      create: { childId, badgeType },
      update: {},
    });
  }
}
