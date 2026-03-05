import { Router } from 'express';
import { prisma } from '../services/prisma';
import { authMiddleware, parentOnly } from '../middleware/auth';
import { addXpToChild, removeXpFromChild } from '../services/game-mechanics';

export const tasksRouter = Router();
tasksRouter.use(authMiddleware);

// Get all tasks for family
tasksRouter.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { familyId: req.auth!.familyId },
      include: {
        assignedTo: { select: { id: true, name: true, avatar: true } },
        completions: {
          where: {
            completedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Create task (parent only)
tasksRouter.post('/', parentOnly, async (req, res) => {
  try {
    const { name, emoji, xp, coins, difficulty, duration, deadline, assignedToId, recurring, isBonus } = req.body;
    const task = await prisma.task.create({
      data: {
        familyId: req.auth!.familyId,
        name, emoji, xp, coins, difficulty, duration,
        deadline: deadline ? new Date(deadline) : null,
        assignedToId, recurring, isBonus,
      },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task (parent only)
tasksRouter.put('/:id', parentOnly, async (req, res) => {
  try {
    const { name, emoji, xp, coins, difficulty, duration, deadline, assignedToId, recurring, isBonus } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        name, emoji, xp, coins, difficulty, duration,
        deadline: deadline ? new Date(deadline) : null,
        assignedToId, recurring, isBonus,
      },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (parent only)
tasksRouter.delete('/:id', parentOnly, async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Complete task
tasksRouter.post('/:id/complete', async (req, res) => {
  try {
    const childId = req.auth!.childId;
    if (!childId) { res.status(403).json({ error: 'Child access required' }); return; }

    const task = await prisma.task.findUniqueOrThrow({ where: { id: req.params.id } });

    const completion = await prisma.taskCompletion.create({
      data: { taskId: task.id, childId },
    });

    const child = await addXpToChild(childId, task.xp, task.coins);
    res.json({ completion, child });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Uncomplete task
tasksRouter.post('/:id/uncomplete', async (req, res) => {
  try {
    const childId = req.auth!.childId;
    if (!childId) { res.status(403).json({ error: 'Child access required' }); return; }

    const task = await prisma.task.findUniqueOrThrow({ where: { id: req.params.id } });

    // Find and delete today's completion
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completion = await prisma.taskCompletion.findFirst({
      where: { taskId: task.id, childId, completedAt: { gte: today } },
    });

    if (completion) {
      await prisma.taskCompletion.delete({ where: { id: completion.id } });
      const child = await removeXpFromChild(childId, task.xp, task.coins);
      res.json({ child });
    } else {
      res.status(404).json({ error: 'No completion found for today' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to uncomplete task' });
  }
});

// Steal task
tasksRouter.post('/:id/steal', async (req, res) => {
  try {
    const childId = req.auth!.childId;
    if (!childId) { res.status(403).json({ error: 'Child access required' }); return; }

    const task = await prisma.task.findUniqueOrThrow({ where: { id: req.params.id } });

    // Check if deadline has passed and task is not completed today
    if (task.deadline && new Date() > task.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existingCompletion = await prisma.taskCompletion.findFirst({
        where: { taskId: task.id, completedAt: { gte: today } },
      });

      if (!existingCompletion) {
        const completion = await prisma.taskCompletion.create({
          data: { taskId: task.id, childId },
        });
        // Bonus XP for stealing
        const child = await addXpToChild(childId, Math.floor(task.xp * 1.5), task.coins + 1);
        res.json({ completion, child, stolen: true });
        return;
      }
    }

    res.status(400).json({ error: 'Task cannot be stolen' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to steal task' });
  }
});
