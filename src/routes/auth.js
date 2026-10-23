import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const emailOk = email => typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;

router.post('/signup', async (req, res, next) => {
    try {
        const { email, password } = req.body ?? {};
        if (!emailOk(email) || typeof password !== 'string' || password.length < 8 || password.length > 72) return res.status(400).json({ error: 'Valid email and password (8-72 characters) required' });
        const hash = await bcrypt.hash(password, 12);
        const { rows } = await query('INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id,email,role', [email.trim().toLowerCase(), hash]);
        res.status(201).json({ user: rows[0] });
    } catch (err) { if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' }); next(err); }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body ?? {};
        if (!emailOk(email) || typeof password !== 'string') return res.status(400).json({ error: 'Email and password required' });
        const { rows } = await query('SELECT id,email,role,password_hash FROM users WHERE email=$1', [email.trim().toLowerCase()]);
        if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) return res.status(401).json({ error: 'Invalid credentials' });
        const user = { id: rows[0].id, email: rows[0].email, role: rows[0].role };
        const access_token = jwt.sign({}, process.env.JWT_SECRET, { subject: user.id, expiresIn: '2h', algorithm: 'HS256' });
        res.json({ access_token, token_type: 'Bearer', user });
    } catch (err) { next(err); }
});

router.get('/me', requireAuth, (req, res) => res.json(req.user));
export default router;
