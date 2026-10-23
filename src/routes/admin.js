import {Router} from 'express';
import {requireAuth,requireRole} from '../middleware/auth.js';
import {query} from '../db.js';
const router=Router();router.use(requireAuth,requireRole('admin'));
router.get('/stats',async(req,res,next)=>{try{const [users,tasks]=await Promise.all([query('SELECT COUNT(*)::int AS count FROM users'),query('SELECT COUNT(*)::int AS count FROM tasks')]);res.json({users:users.rows[0].count,tasks:tasks.rows[0].count});}catch(e){next(e);}});
export default router;
