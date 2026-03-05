import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateToken, authMiddleware, parentOnly, AuthPayload } from './auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('generateToken', () => {
  it('generates a valid JWT', () => {
    const payload: AuthPayload = { familyId: 'fam-1', role: 'parent' };
    const token = generateToken(payload);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded.familyId).toBe('fam-1');
    expect(decoded.role).toBe('parent');
  });

  it('includes childId for child role', () => {
    const payload: AuthPayload = { familyId: 'fam-1', role: 'child', childId: 'child-1' };
    const token = generateToken(payload);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    expect(decoded.childId).toBe('child-1');
  });
});

describe('authMiddleware', () => {
  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('rejects requests without Authorization header', () => {
    const req = { headers: {} } as any;
    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.here' } } as any;
    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts valid token and sets req.auth', () => {
    const payload: AuthPayload = { familyId: 'fam-1', role: 'parent' };
    const token = generateToken(payload);
    const req = { headers: { authorization: `Bearer ${token}` } } as any;
    const res = mockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.auth.familyId).toBe('fam-1');
    expect(req.auth.role).toBe('parent');
  });
});

describe('parentOnly', () => {
  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('allows parent role', () => {
    const req = { auth: { role: 'parent', familyId: 'f1' } } as any;
    const res = mockRes();
    const next = vi.fn();

    parentOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rejects child role', () => {
    const req = { auth: { role: 'child', familyId: 'f1' } } as any;
    const res = mockRes();
    const next = vi.fn();

    parentOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
