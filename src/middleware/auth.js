import jwt from 'jsonwebtoken';
import { query } from '../db.js';
export async function requireAuth(req,res,next) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return res.status(401).json({error:'Bearer token required'});
  try {
    const payload = jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']});
    if (!payload.sub) return res.status(401).json({error:'Invalid token'});
    const {rows} = await query('SELECT id,email,role FROM users WHERE id=$1',[payload.sub]);
    if (!rows.length) return res.status(401).json({error:'Invalid token'});
    req.user = rows[0]; next();
  } catch (error) { if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') return res.status(401).json({error:'Invalid or expired token'}); next(error); }
}
export function requireRole(role) { return (req,res,next) => req.user?.role === role ? next() : res.status(403).json({error:'Forbidden'}); }
