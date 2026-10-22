import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.use(requireAuth);
const fields = ['title','description','due_at','estimated_minutes','priority','category','completed'];
const clean = (body) => Object.fromEntries(fields.filter(k => Object.hasOwn(body,k)).map(k=>[k,body[k]]));
const valid = (v,create=false) => (!create || typeof v.title === 'string' && v.title.trim().length > 0) && (!('title' in v) || typeof v.title === 'string' && v.title.trim().length > 0) && (!('estimated_minutes' in v) || Number.isInteger(v.estimated_minutes) && v.estimated_minutes > 0) && (!('priority' in v) || ['low','medium','high'].includes(v.priority)) && (!('completed' in v) || typeof v.completed === 'boolean') && (!('due_at' in v) || v.due_at === null || typeof v.due_at === 'string' && !Number.isNaN(Date.parse(v.due_at))) && (!('category' in v) || typeof v.category === 'string') && (!('description' in v) || v.description === null || typeof v.description === 'string');
function fail(res,error){ return res.status(400).json({error:error.message}); }
router.get('/',async(req,res)=>{const {data,error}=await req.db.from('tasks').select('*').order('created_at',{ascending:false});if(error)return fail(res,error);res.json(data);});
router.post('/',async(req,res)=>{const v=clean(req.body);if(!valid(v,true))return res.status(400).json({error:'Invalid task fields'});const {data,error}=await req.db.from('tasks').insert({...v,user_id:req.user.id}).select().single();if(error)return fail(res,error);res.status(201).json(data);});
router.get('/:id',async(req,res)=>{const {data,error}=await req.db.from('tasks').select('*').eq('id',req.params.id).eq('user_id',req.user.id).maybeSingle();if(error)return fail(res,error);if(!data)return res.status(404).json({error:'Task not found'});res.json(data);});
router.patch('/:id',async(req,res)=>{const v=clean(req.body);if(!Object.keys(v).length||!valid(v))return res.status(400).json({error:'Invalid task fields'});const {data,error}=await req.db.from('tasks').update(v).eq('id',req.params.id).eq('user_id',req.user.id).select().maybeSingle();if(error)return fail(res,error);if(!data)return res.status(404).json({error:'Task not found'});res.json(data);});
router.delete('/:id',async(req,res)=>{const {data,error}=await req.db.from('tasks').delete().eq('id',req.params.id).eq('user_id',req.user.id).select('id').maybeSingle();if(error)return fail(res,error);if(!data)return res.status(404).json({error:'Task not found'});res.status(204).end();});
export default router;
