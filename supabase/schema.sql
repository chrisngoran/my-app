-- Finance Tracker — database schema with row-level security.
-- Run this in the Supabase SQL editor (or `supabase db push`) after creating
-- your project. Each user can only ever see and modify their own rows.

create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  date        date not null,
  type        text not null check (type in ('income', 'expense')),
  category    text not null,
  description text not null default '',
  amount      numeric not null check (amount > 0),
  created_at  timestamptz not null default now()
);

create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- Row-level security: the heart of "security". Without an authenticated
-- session that matches user_id, no row is readable or writable.
alter table public.transactions enable row level security;

create policy "own rows: select"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "own rows: insert"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "own rows: update"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own rows: delete"
  on public.transactions for delete
  using (auth.uid() = user_id);
