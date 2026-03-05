import { Router } from 'express';
import { prisma } from '../services/prisma';
import { authMiddleware, parentOnly } from '../middleware/auth';
import { getLevelTitle } from '../services/game-mechanics';

export const childrenRouter = Router();
childrenRouter.use(authMiddleware);

// Get all children
childrenRouter.get('/', async (req, res) => {
  try {
    const children = await prisma.child.findMany({
      where: { familyId: req.auth!.familyId },
      include: { badges: true },
    });
    const enriched = children.map(c => ({ ...c, levelTitle: getLevelTitle(c.level) }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get children' });
  }
});

// Get single child
childrenRouter.get('/:id', async (req, res) => {
  try {
    const child = await prisma.child.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { badges: true },
    });
    res.json({ ...child, levelTitle: getLevelTitle(child.level) });
  } catch (err) {
    res.status(500).json({ error: 'Child not found' });
  }
});

// Create child (parent only)
childrenRouter.post('/', parentOnly, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const child = await prisma.child.create({
      data: { familyId: req.auth!.familyId, name, avatar },
    });
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create child' });
  }
});

// Update child (parent only)
childrenRouter.put('/:id', parentOnly, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const child = await prisma.child.update({
      where: { id: req.params.id },
      data: { name, avatar },
    });
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// Delete child (parent only)
childrenRouter.delete('/:id', parentOnly, async (req, res) => {
  try {
    await prisma.child.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete child' });
  }
});
