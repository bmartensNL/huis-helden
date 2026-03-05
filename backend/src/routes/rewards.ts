import { Router } from 'express';
import { prisma } from '../services/prisma';
import { authMiddleware, parentOnly } from '../middleware/auth';

export const rewardsRouter = Router();
rewardsRouter.use(authMiddleware);

// Get all rewards
rewardsRouter.get('/', async (req, res) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { familyId: req.auth!.familyId },
    });
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get rewards' });
  }
});

// Create reward (parent only)
rewardsRouter.post('/', parentOnly, async (req, res) => {
  try {
    const { emoji, name, cost } = req.body;
    const reward = await prisma.reward.create({
      data: { familyId: req.auth!.familyId, emoji, name, cost },
    });
    res.json(reward);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// Update reward (parent only)
rewardsRouter.put('/:id', parentOnly, async (req, res) => {
  try {
    const { emoji, name, cost } = req.body;
    const reward = await prisma.reward.update({
      where: { id: req.params.id },
      data: { emoji, name, cost },
    });
    res.json(reward);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// Delete reward (parent only)
rewardsRouter.delete('/:id', parentOnly, async (req, res) => {
  try {
    await prisma.reward.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

// Claim reward
rewardsRouter.post('/:id/claim', async (req, res) => {
  try {
    const childId = req.auth!.childId;
    if (!childId) { res.status(403).json({ error: 'Child access required' }); return; }

    const reward = await prisma.reward.findUniqueOrThrow({ where: { id: req.params.id } });
    const child = await prisma.child.findUniqueOrThrow({ where: { id: childId } });

    if (child.coins < reward.cost) {
      res.status(400).json({ error: 'Not enough coins' });
      return;
    }

    const [claim, updatedChild] = await prisma.$transaction([
      prisma.rewardClaim.create({ data: { rewardId: reward.id, childId } }),
      prisma.child.update({
        where: { id: childId },
        data: { coins: child.coins - reward.cost },
      }),
    ]);

    res.json({ claim, child: updatedChild });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});
