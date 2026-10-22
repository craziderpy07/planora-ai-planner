import { Router } from 'express';
import { supabase } from '../supabase.js';
const router = Router();
router.post('/signup', async (req,res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Valid email and password of at least 8 characters required' });
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ user: data.user, emailConfirmationRequired: !data.session });
});
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password required' });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: 'Invalid credentials or unconfirmed email' });
  res.json({ access_token: data.session.access_token, user: { id: data.user.id, email: data.user.email } });
});
export default router;
