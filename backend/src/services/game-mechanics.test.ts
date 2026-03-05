import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma BEFORE any imports that use it
vi.mock('./prisma', () => ({
  prisma: {
    child: {
      findUniqueOrThrow: vi.fn(),
      update: vi.fn(),
    },
    taskCompletion: {
      count: vi.fn(),
    },
    badge: {
      upsert: vi.fn(),
    },
  },
}));

import { getXpForLevel, getLevelTitle, addXpToChild, removeXpFromChild } from './game-mechanics';
import { prisma } from './prisma';

const mockPrisma = vi.mocked(prisma, true);

const mockChild = {
  id: 'child-1',
  familyId: 'fam-1',
  name: 'Test',
  avatar: '🦸',
  xp: 80,
  level: 1,
  maxXp: 100,
  coins: 5,
  streak: 1,
  lastActiveDate: new Date(),
  createdAt: new Date(),
};

describe('getXpForLevel', () => {
  it('returns 0 for level 1', () => {
    expect(getXpForLevel(1)).toBe(0);
  });

  it('returns BASE_XP (100) for level 2', () => {
    expect(getXpForLevel(2)).toBe(100);
  });

  it('scales by 1.4x per level', () => {
    expect(getXpForLevel(3)).toBe(Math.floor(100 * Math.pow(1.4, 1)));
    expect(getXpForLevel(4)).toBe(Math.floor(100 * Math.pow(1.4, 2)));
  });

  it('returns 0 for level 0 or below', () => {
    expect(getXpForLevel(0)).toBe(0);
    expect(getXpForLevel(-1)).toBe(0);
  });

  it('increases monotonically', () => {
    for (let i = 2; i < 10; i++) {
      expect(getXpForLevel(i + 1)).toBeGreaterThan(getXpForLevel(i));
    }
  });
});

describe('getLevelTitle', () => {
  it('returns Beginner for level 1', () => {
    expect(getLevelTitle(1)).toBe('Beginner');
  });

  it('returns Helper for level 2', () => {
    expect(getLevelTitle(2)).toBe('Helper');
  });

  it('returns Legende for level 7', () => {
    expect(getLevelTitle(7)).toBe('Legende');
  });

  it('caps at Legende for levels above 7', () => {
    expect(getLevelTitle(10)).toBe('Legende');
    expect(getLevelTitle(100)).toBe('Legende');
  });
});

describe('addXpToChild', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({ ...mockChild } as any);
    mockPrisma.child.update.mockImplementation(({ data }: any) =>
      Promise.resolve({ ...mockChild, ...data }) as any,
    );
    mockPrisma.taskCompletion.count.mockResolvedValue(0);
    mockPrisma.badge.upsert.mockResolvedValue({} as any);
  });

  it('adds XP without leveling up', async () => {
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({ ...mockChild, xp: 10 } as any);

    await addXpToChild('child-1', 20, 3);

    expect(mockPrisma.child.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'child-1' },
        data: expect.objectContaining({ xp: 30, level: 1 }),
      }),
    );
  });

  it('levels up when XP exceeds maxXp', async () => {
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({
      ...mockChild,
      xp: 90,
      maxXp: 100,
    } as any);

    await addXpToChild('child-1', 20, 1);

    expect(mockPrisma.child.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ level: 2, xp: 10 }),
      }),
    );
  });

  it('adds coins', async () => {
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({
      ...mockChild,
      coins: 10,
      xp: 0,
    } as any);

    await addXpToChild('child-1', 5, 7);

    expect(mockPrisma.child.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ coins: 17 }),
      }),
    );
  });

  it('resets streak if last active was more than a day ago', async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({
      ...mockChild,
      lastActiveDate: threeDaysAgo,
      streak: 5,
      xp: 0,
    } as any);

    await addXpToChild('child-1', 10, 1);

    expect(mockPrisma.child.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ streak: 1 }),
      }),
    );
  });

  it('increments streak for consecutive day', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({
      ...mockChild,
      lastActiveDate: yesterday,
      streak: 3,
      xp: 0,
    } as any);

    await addXpToChild('child-1', 10, 1);

    expect(mockPrisma.child.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ streak: 4 }),
      }),
    );
  });
});

describe('removeXpFromChild', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({ ...mockChild } as any);
    mockPrisma.child.update.mockImplementation(({ data }: any) =>
      Promise.resolve({ ...mockChild, ...data }) as any,
    );
  });

  it('removes XP without going below 0', async () => {
    mockPrisma.child.findUniqueOrThrow.mockResolvedValue({
      ...mockChild,
      xp: 5,
      coins: 2,
    } as any);

    await removeXpFromChild('child-1', 20, 10);

    expect(mockPrisma.child.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ xp: 0, coins: 0 }),
      }),
    );
  });
});
