import { createHash, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config, adminEnabled } from './config.js';

const digest = (s) => createHash('sha256').update(String(s)).digest();

/** Constant-time password check (both sides hashed to equal length first). */
export function passwordMatches(input) {
  if (!adminEnabled) return false;
  return timingSafeEqual(digest(input), digest(config.adminPassword));
}

export function issueToken() {
  return jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '12h' });
}

/** Express middleware: only lets the request through with a valid admin token. */
export function requireAdmin(req, res, next) {
  if (!adminEnabled) {
    return res.status(503).json({ error: 'Admin login is not set up. Add ADMIN_PASSWORD and JWT_SECRET to backend/.env.' });
  }
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role !== 'admin') throw new Error('wrong role');
    return next();
  } catch {
    return res.status(401).json({ error: 'Your session has ended. Please log in again.' });
  }
}
