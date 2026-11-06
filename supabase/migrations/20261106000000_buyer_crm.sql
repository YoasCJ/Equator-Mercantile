-- Run in Supabase SQL Editor before enabling the app.
-- Disable public signups in Supabase Auth settings. Only manually approved users can use this database.
create extension if not exists pgcrypto;
create table if not exists public.allowed_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'staff' check (role in ('admin','staff')),
  created_at timestamptz not null default now()
);
alter table public.allowed_users enable row level security;
create policy "Users can read own enrollment" on public.allowed_users
  for select to authenticated using (user_id=auth.uid());

create table if not exists public.buyers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 250),
  location text not null default '',
  phone text not null default '',
  website text not null default '',
  source text not null unique check (char_length(source) between 10 and 2000),
  verification text not null default 'Belum diverifikasi',
  category text not null default '',
  status text not null default 'New Lead'
    check (status in ('New Lead','Contacted','Interested','Quotation','Negotiation','Won','Lost')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists buyers_phone_idx on public.buyers(phone) where phone<>'';
create index if not exists buyers_status_idx on public.buyers(status);
alter table public.buyers enable row level security;
create policy "Enrolled users may read buyers" on public.buyers for select to authenticated
  using (exists(select 1 from public.allowed_users a where a.user_id=auth.uid()));
create policy "Enrolled users may add buyers" on public.buyers for insert to authenticated
  with check (created_by=auth.uid() and exists(select 1 from public.allowed_users a where a.user_id=auth.uid()));
create policy "Enrolled users may update buyers" on public.buyers for update to authenticated
  using (exists(select 1 from public.allowed_users a where a.user_id=auth.uid()))
  with check (exists(select 1 from public.allowed_users a where a.user_id=auth.uid()));
-- No delete policy; deletion is disabled by default.
-- Enrollment: after admin invites a user through Supabase Auth, obtain their user UUID and run:
-- insert into public.allowed_users(user_id, role) values ('USER_UUID', 'admin');
