create extension if not exists pgcrypto;
create table if not exists public.tasks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(trim(title)) > 0),
 description text,
 due_at timestamptz,
 estimated_minutes integer check(estimated_minutes > 0),
 priority text not null default 'medium' check(priority in ('low','medium','high')),
 category text not null default 'general',
 completed boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
alter table public.tasks enable row level security;
create policy "Users read own tasks" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own tasks" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own tasks" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own tasks" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);
