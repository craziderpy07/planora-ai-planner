# Planora — AI-Powered Planner (Neon Edition)

Backend foundation built with Node.js, Express, Neon PostgreSQL, JWT authentication, bcryptjs, Socket.IO, and JSONPlaceholder.

## Prerequisites
- Node.js 20+
- Neon account and PostgreSQL database
- Postman (optional)

## Setup
1. Create a Neon project at https://console.neon.tech/.
2. Open the Neon SQL Editor and execute `sql/schema.sql`.
3. Copy `.env.example` to `.env` and configure `DATABASE_URL`, `JWT_SECRET` (at least 32 random characters), and `CORS_ORIGIN`.
4. Run `npm install` and `npm run dev`.
5. Open `http://localhost:3000/api/health`.

Generate a JWT secret in PowerShell:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

Keep `.env` private. Use the Neon pooled connection string from the Neon dashboard with TLS (`sslmode=require`). The database credential is backend-only.

## REST endpoints
| Method | Path | Authorization | Purpose |
|---|---|---|---|
| GET | `/api/health` | None | Verify backend and database connectivity |
| POST | `/api/auth/signup` | None | Create account `{ "email": "...", "password": "..." }` |
| POST | `/api/auth/login` | None | Obtain JWT access token |
| GET | `/api/auth/me` | Bearer JWT | View current account |
| GET | `/api/tasks` | Bearer JWT | List own tasks |
| POST | `/api/tasks` | Bearer JWT | Create task |
| GET | `/api/tasks/:id` | Bearer JWT | Read own task |
| PATCH | `/api/tasks/:id` | Bearer JWT | Update own task |
| DELETE | `/api/tasks/:id` | Bearer JWT | Delete own task |
| GET | `/api/external/sample-tasks` | Bearer JWT | JSONPlaceholder sample task feed |
| GET | `/api/admin/stats` | Admin JWT | Aggregate user/task counts |

Task payload example:
```json
{"title":"Complete backend checkpoint","description":"Test Neon CRUD","due_at":"2026-10-25T23:00:00Z","estimated_minutes":120,"priority":"high","category":"school","completed":false}
```

In Postman, send a login request and use the returned `access_token` under Authorization > Bearer Token for protected routes.

## Real-time
Socket.IO clients connect to the backend with `auth: { token: accessToken }`. On authenticated connection, each client joins its private user room. The backend emits `task:created`, `task:updated`, and `task:deleted` events to that room after successful database writes. The frontend must subscribe and refresh its state; this repository does not include a frontend.

## Roles
All signups get the `user` role. The `admin` role is never assigned by public endpoints. To designate an admin for a class demo, use the Neon SQL Editor manually on a trusted account:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';
```
Never expose this operation to public users. Admin-only route: `/api/admin/stats`.

## Planned integrations (not implemented in this checkpoint starter)
- Gemini API for task breakdown, prioritization and scheduling recommendations
- Google Calendar API with OAuth consent for external events and calendar sync
- Availability, reminders, Pomodoro sessions and scheduling persistence
- Frontend dashboard and calendar

## Security notes / known limitations
- Uses bcrypt password hashes, expiring JWTs, parameterized SQL, ownership filters and basic auth rate limiting.
- Email verification, password reset, refresh tokens, logout revocation, advanced validation, audit logging, database-level row security and automated tests should be added before production.
- Neon provides PostgreSQL hosting, not Supabase Auth or Supabase Realtime. Authentication and live events are implemented in the Express backend.
- Socket.IO events are emitted by this Node process after API writes, not for direct database edits or other server instances. For horizontal scaling, use a shared adapter or database change feed.
- JSONPlaceholder is a demonstration/sample feed. Consider a more meaningful public data integration for the final project.
- Google Calendar integration will require user OAuth authorization; a simple API key does not grant access to private calendars.
