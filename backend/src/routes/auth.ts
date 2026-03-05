import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../services/prisma';
import { generateToken } from '../middleware/auth';

export const authRouter = Router();

// Register family
authRouter.post('/register', async (req, res) => {
  try {
    const { pin } = req.body;
    const hashedPin = await bcrypt.hash(pin, 10);
    const family = await prisma.family.create({ data: { pin: hashedPin } });
    const token = generateToken({ familyId: family.id, role: 'parent' });
    res.json({ token, familyId: family.id });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Parent login
authRouter.post('/parent-login', async (req, res) => {
  try {
    const { familyId, pin } = req.body;
    const family = await prisma.family.findUnique({ where: { id: familyId } });
    if (!family || !(await bcrypt.compare(pin, family.pin))) {
      res.status(401).json({ error: 'Invalid PIN' });
      return;
    }
    const token = generateToken({ familyId: family.id, role: 'parent' });
    res.json({ token, familyId: family.id });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Child select
authRouter.post('/child-select', async (req, res) => {
  try {
    const { childId } = req.body;
    const child = await prisma.child.findUnique({ where: { id: childId }, include: { family: true } });
    if (!child) {
      res.status(404).json({ error: 'Child not found' });
      return;
    }
    const token = generateToken({ familyId: child.familyId, role: 'child', childId: child.id });
    res.json({ token, child });
  } catch (err) {
    res.status(500).json({ error: 'Selection failed' });
  }
});

// Get family children (for selection screen)
authRouter.get('/children/:familyId', async (req, res) => {
  try {
    const children = await prisma.child.findMany({
      where: { familyId: req.params.familyId },
      select: { id: true, name: true, avatar: true, level: true },
    });
    res.json(children);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get children' });
  }
});
