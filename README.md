# Planora AI Planner — Backend Starter

Node.js/Express REST API with Supabase authentication, PostgreSQL task CRUD, and a JSONPlaceholder API integration. This is a **Checkpoint 2 starter**, not the finished AI planner. Gemini, Google Calendar, role-based access, realtime, Pomodoro, and deployment are planned for later stages.

## Setup
1. Install Node.js 20+ and run `npm install`.
2. Create a Supabase project. Run `sql/schema.sql` in the Supabase SQL Editor (once on a fresh project).
3. Copy `.env.example` to `.env` and enter your Supabase project URL and publishable/anon key (never the service-role key).
4. Run `npm run dev`.
5. Test `GET http://localhost:3000/api/health`.

## Authentication
`POST /api/auth/signup` and `POST /api/auth/login` accept JSON `{ "email": "student@example.com", "password": "StrongPass123!" }`. If email confirmation is enabled, confirm your email before logging in. Login returns `access_token`. Send `Authorization: Bearer <access_token>` to protected routes.

## Endpoints
- `GET /api/health` — server status
- `POST /api/auth/signup` — register
- `POST /api/auth/login` — log in
- `GET /api/tasks` — list own tasks
- `POST /api/tasks` — create task
- `GET /api/tasks/:id` — read task
- `PATCH /api/tasks/:id` — update task
- `DELETE /api/tasks/:id` — delete task
- `GET /api/external/sample-tasks` — retrieve and normalize JSONPlaceholder sample todos (read-only)

Example task JSON: `{ "title": "Finish CPSC 449 project", "description": "Complete backend checkpoint", "due_at": "2026-10-25T23:00:00Z", "estimated_minutes": 120, "priority": "high", "category": "school", "completed": false }`.

## Notes
User task isolation is enforced by Supabase Row Level Security. The starter does not include administrator roles, real-time subscriptions, or an AI scheduling engine. Avoid uploading sensitive personal details to external AI services. Never commit `.env` or tokens. Add rate limits, stricter input validation, and production CORS configuration before deployment.
