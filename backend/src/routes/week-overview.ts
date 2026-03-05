import { Router } from 'express';
import { prisma } from '../services/prisma';
import { authMiddleware, parentOnly } from '../middleware/auth';

export const weekOverviewRouter = Router();
weekOverviewRouter.use(authMiddleware);
weekOverviewRouter.use(parentOnly);

weekOverviewRouter.get('/', async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const children = await prisma.child.findMany({
      where: { familyId: req.auth!.familyId },
      include: {
        completions: {
          where: { completedAt: { gte: weekStart } },
          include: { task: { select: { name: true, xp: true, coins: true } } },
        },
      },
    });

    const overview = children.map(child => ({
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      level: child.level,
      streak: child.streak,
      tasksThisWeek: child.completions.length,
      xpThisWeek: child.completions.reduce((sum, c) => sum + c.task.xp, 0),
      coinsThisWeek: child.completions.reduce((sum, c) => sum + c.task.coins, 0),
      completions: child.completions,
    }));

    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get week overview' });
  }
});
