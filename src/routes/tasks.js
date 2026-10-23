import {Router} from 'express';
import {query} from '../db.js';
import {requireAuth} from '../middleware/auth.js';
const router=Router();router.use(requireAuth);
const fields=['title','description','due_at','estimated_minutes','priority','category','completed'];
const clean=b=>Object.fromEntries(fields.filter(k=>Object.hasOwn(b??{},k)).map(k=>[k,b[k]]));
const valid=(v,create=false)=> (!create||typeof v.title==='string'&&v.title.trim().length>0) &&
 (!('title' in v)||typeof v.title==='string'&&v.title.trim().length>0&&v.title.length<=255) &&
 (!('description' in v)||v.description===null||typeof v.description==='string') &&
 (!('due_at' in v)||v.due_at===null||typeof v.due_at==='string'&&!Number.isNaN(Date.parse(v.due_at))) &&
 (!('estimated_minutes' in v)||v.estimated_minutes===null||Number.isInteger(v.estimated_minutes)&&v.estimated_minutes>0) &&
 (!('priority' in v)||['low','medium','high'].includes(v.priority)) &&
 (!('category' in v)||typeof v.category==='string'&&v.category.length<=100) &&
 (!('completed' in v)||typeof v.completed==='boolean');
const isUuid=s=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
function emit(req,event,task){req.io.to(`user:${req.user.id}`).emit(event,task);}
router.get('/',async(req,res,next)=>{try{const {rows}=await query('SELECT * FROM tasks WHERE user_id=$1 ORDER BY created_at DESC',[req.user.id]);res.json(rows);}catch(e){next(e);}});
router.post('/',async(req,res,next)=>{try{const v=clean(req.body);if(!valid(v,true))return res.status(400).json({error:'Invalid task fields'});const keys=Object.keys(v);const params=[req.user.id,...keys.map(k=>v[k])];const sql=`INSERT INTO tasks(user_id,${keys.join(',')}) VALUES($1,${keys.map((_,i)=>`$${i+2}`).join(',')}) RETURNING *`;const {rows}=await query(sql,params);emit(req,'task:created',rows[0]);res.status(201).json(rows[0]);}catch(e){next(e);}});
router.get('/:id',async(req,res,next)=>{try{if(!isUuid(req.params.id))return res.status(400).json({error:'Invalid task ID'});const {rows}=await query('SELECT * FROM tasks WHERE id=$1 AND user_id=$2',[req.params.id,req.user.id]);if(!rows.length)return res.status(404).json({error:'Task not found'});res.json(rows[0]);}catch(e){next(e);}});
router.patch('/:id',async(req,res,next)=>{try{if(!isUuid(req.params.id))return res.status(400).json({error:'Invalid task ID'});const v=clean(req.body);const keys=Object.keys(v);if(!keys.length||!valid(v))return res.status(400).json({error:'Invalid task fields'});const set=keys.map((k,i)=>`${k}=$${i+3}`).join(',');const {rows}=await query(`UPDATE tasks SET ${set},updated_at=NOW() WHERE id=$1 AND user_id=$2 RETURNING *`,[req.params.id,req.user.id,...keys.map(k=>v[k])]);if(!rows.length)return res.status(404).json({error:'Task not found'});emit(req,'task:updated',rows[0]);res.json(rows[0]);}catch(e){next(e);}});
router.delete('/:id',async(req,res,next)=>{try{if(!isUuid(req.params.id))return res.status(400).json({error:'Invalid task ID'});const {rows}=await query('DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING id',[req.params.id,req.user.id]);if(!rows.length)return res.status(404).json({error:'Task not found'});emit(req,'task:deleted',rows[0]);res.status(204).end();}catch(e){next(e);}});
export default router;
