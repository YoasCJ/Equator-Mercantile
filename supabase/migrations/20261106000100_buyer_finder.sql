create table crm_private.buyer_search_usage (
  search_date date primary key,
  request_count integer not null check (request_count between 1 and 20)
);

-- Each reservation covers one external request, even if that request fails.
create function public.reserve_buyer_search(daily_limit integer) returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if daily_limit is null or daily_limit not between 1 and 20 then
    raise exception 'Invalid buyer search limit' using errcode = '22023';
  end if;

  insert into crm_private.buyer_search_usage as usage (search_date, request_count)
  values ((now() at time zone 'Asia/Jakarta')::date, 1)
  on conflict (search_date) do update set request_count = usage.request_count + 1
    where usage.request_count < daily_limit;
  return found;
end;
$$;

revoke execute on function public.reserve_buyer_search(integer) from public, anon, authenticated;
grant execute on function public.reserve_buyer_search(integer) to service_role;

-- Keep manual CRM inserts unchanged. Serialize Finder imports before checking duplicates.
create function public.save_buyer_candidate(candidate_name text, candidate_location text, candidate_source text)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if not exists (select 1 from public.crm_members) then
    raise exception 'Team access required' using errcode = '42501';
  end if;
  if candidate_source is null or candidate_source not like 'https://%' then
    raise exception 'A secure source URL is required' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(5061106);
  if exists (
    select 1 from public.buyers
    where source = candidate_source
      or lower(btrim(company_name)) = lower(btrim(candidate_name))
  ) then
    return null;
  end if;

  insert into public.buyers (company_name, location, source)
  values (btrim(candidate_name), nullif(btrim(candidate_location), ''), candidate_source)
  returning id into saved_id;
  return saved_id;
end;
$$;

revoke execute on function public.save_buyer_candidate(text, text, text) from public, anon;
grant execute on function public.save_buyer_candidate(text, text, text) to authenticated;
