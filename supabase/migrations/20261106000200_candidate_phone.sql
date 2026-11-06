-- Preserve existing CRM rows and allow reviewers to save a checked phone number.
drop function public.save_buyer_candidate(text, text, text);

create function public.save_buyer_candidate(
  candidate_name text, candidate_location text, candidate_source text, candidate_phone text default null
)
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

  insert into public.buyers (company_name, location, source, phone)
  values (
    btrim(candidate_name), nullif(btrim(candidate_location), ''),
    candidate_source, nullif(btrim(candidate_phone), '')
  )
  returning id into saved_id;
  return saved_id;
end;
$$;

revoke execute on function public.save_buyer_candidate(text, text, text, text) from public, anon;
grant execute on function public.save_buyer_candidate(text, text, text, text) to authenticated;
