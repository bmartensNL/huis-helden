import { Router } from 'express';
import { prisma } from '../services/prisma';
import { authMiddleware } from '../middleware/auth';

export const badgesRouter = Router();
badgesRouter.use(authMiddleware);

const BADGE_INFO: Record<string, { emoji: string; name: string; description: string }> = {
  first_task: { emoji: '🌟', name: 'Eerste Taak', description: 'Voltooi je eerste taak' },
  streak_master: { emoji: '🔥', name: 'Streak Master', description: '7 dagen streak' },
  hard_worker: { emoji: '💪', name: 'Hard Werker', description: '10 moeilijke taken voltooid' },
  speedster: { emoji: '🏃', name: 'Speedster', description: '5 taken in één dag' },
  task_thief: { emoji: '🕵️', name: 'Taak Dief', description: 'Steel 3 taken' },
  legend: { emoji: '👑', name: 'Legende', description: 'Bereik level 7' },
};

badgesRouter.get('/:childId', async (req, res) => {
  try {
    const earned = await prisma.badge.findMany({
      where: { childId: req.params.childId },
    });

    const allBadges = Object.entries(BADGE_INFO).map(([type, info]) => {
      const earnedBadge = earned.find(b => b.badgeType === type);
      return {
        type,
        ...info,
        earned: !!earnedBadge,
        earnedAt: earnedBadge?.earnedAt || null,
      };
    });

    res.json(allBadges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get badges' });
  }
});
