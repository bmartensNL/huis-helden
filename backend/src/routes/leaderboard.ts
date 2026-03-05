import { Router } from 'express';
import { prisma } from '../services/prisma';
import { authMiddleware } from '../middleware/auth';
import { getLevelTitle } from '../services/game-mechanics';

export const leaderboardRouter = Router();
leaderboardRouter.use(authMiddleware);

leaderboardRouter.get('/', async (req, res) => {
  try {
    const children = await prisma.child.findMany({
      where: { familyId: req.auth!.familyId },
      orderBy: [{ level: 'desc' }, { xp: 'desc' }],
      select: {
        id: true, name: true, avatar: true, level: true, xp: true, streak: true, coins: true,
        _count: { select: { completions: true } },
      },
    });

    const leaderboard = children.map((c, i) => ({
      rank: i + 1,
      ...c,
      levelTitle: getLevelTitle(c.level),
      totalCompletions: c._count.completions,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});
