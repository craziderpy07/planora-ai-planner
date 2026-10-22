import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.get('/sample-tasks', requireAuth, async(req,res)=>{
 try { const response=await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10',{signal:AbortSignal.timeout(7000)});if(!response.ok)throw new Error('Upstream API error');const tasks=await response.json();res.json(tasks.map(t=>({external_id:t.id,title:t.title,completed:t.completed,source:'JSONPlaceholder'}))); }
 catch {res.status(502).json({error:'Could not retrieve sample tasks'});}
});
export default router;
