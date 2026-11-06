create schema crm_private;
revoke all on schema crm_private from public, anon, authenticated;

create type public.crm_role as enum ('admin', 'staff');
create type public.buyer_status as enum (
  'new', 'qualified', 'contacted', 'follow_up', 'won', 'lost'
);

create table public.crm_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.crm_role not null default 'staff'
);

create table public.buyers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(company_name) <= 160 and company_name ~ '[^[:space:]]'),
  location text check (char_length(location) <= 160),
  phone text check (char_length(phone) <= 40),
  source text check (char_length(source) <= 500),
  status public.buyer_status not null default 'new',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.buyer_activities (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.buyers (id),
  actor_id uuid default auth.uid() references auth.users (id) on delete set null,
  kind text not null default 'note' check (kind in ('created', 'status_changed', 'note')),
  note text,
  old_status public.buyer_status,
  new_status public.buyer_status,
  created_at timestamptz not null default now(),
  check (
    (kind = 'note' and note is not null and char_length(note) <= 2000 and note ~ '[^[:space:]]'
      and old_status is null and new_status is null)
    or (kind = 'created' and note is null and old_status is null and new_status is not null)
    or (kind = 'status_changed' and note is null and old_status is not null
      and new_status is not null and old_status <> new_status)
  )
);

create index buyers_recent_idx on public.buyers (created_at desc, id);
create index buyers_status_recent_idx on public.buyers (status, created_at desc, id);
create index buyer_activities_recent_idx on public.buyer_activities (buyer_id, created_at desc, id);

alter table public.crm_members enable row level security;
alter table public.buyers enable row level security;
alter table public.buyer_activities enable row level security;

revoke all on public.crm_members, public.buyers, public.buyer_activities from public, anon, authenticated;
grant select on public.crm_members, public.buyers, public.buyer_activities to authenticated;
grant insert (company_name, location, phone, source) on public.buyers to authenticated;
grant update (status) on public.buyers to authenticated;
grant insert (buyer_id, note) on public.buyer_activities to authenticated;

create policy read_own_membership on public.crm_members
  for select to authenticated using (user_id = (select auth.uid()));

create policy members_read_buyers on public.buyers
  for select to authenticated using ((select exists (select 1 from public.crm_members)));
create policy members_add_buyers on public.buyers
  for insert to authenticated with check (
    (select exists (select 1 from public.crm_members)) and created_by = (select auth.uid())
  );
create policy members_change_status on public.buyers
  for update to authenticated
  using ((select exists (select 1 from public.crm_members)))
  with check ((select exists (select 1 from public.crm_members)));

create policy members_read_activity on public.buyer_activities
  for select to authenticated using ((select exists (select 1 from public.crm_members)));
create policy members_add_notes on public.buyer_activities
  for insert to authenticated with check (
    (select exists (select 1 from public.crm_members))
    and actor_id = (select auth.uid()) and kind = 'note'
    and exists (select 1 from public.buyers where buyers.id = buyer_activities.buyer_id)
  );

create function crm_private.stamp_buyer_update() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := clock_timestamp();
  return new;
end;
$$;

-- The client can append notes. Only this trigger can append status history.
create function crm_private.record_buyer_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.buyer_activities (buyer_id, actor_id, kind, new_status)
    values (new.id, auth.uid(), 'created', new.status);
  elsif old.status is distinct from new.status then
    insert into public.buyer_activities (buyer_id, actor_id, kind, old_status, new_status, created_at)
    values (new.id, auth.uid(), 'status_changed', old.status, new.status, new.updated_at);
  end if;
  return null;
end;
$$;

revoke execute on function crm_private.stamp_buyer_update(), crm_private.record_buyer_change()
  from public, anon, authenticated;

create trigger stamp_buyer_update before update on public.buyers
  for each row execute function crm_private.stamp_buyer_update();
create trigger record_buyer_change after insert or update on public.buyers
  for each row execute function crm_private.record_buyer_change();
