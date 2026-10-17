-- Run once in the Supabase SQL editor before deploying the updated site.
-- Keep the existing likes_counter row and its public SELECT policy.
begin;

create table if not exists public.portfolio_like_cooldowns (
  visitor_hash text primary key check (visitor_hash ~ '^[0-9a-f]{64}$'),
  last_liked_at timestamptz not null
);
alter table public.portfolio_like_cooldowns enable row level security;
revoke all on public.portfolio_like_cooldowns from public, anon, authenticated;

create or replace function public.submit_portfolio_like(p_visitor_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted_at timestamptz;
  next_at timestamptz;
  current_total bigint;
begin
  if p_visitor_hash is null or p_visitor_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid visitor hash';
  end if;

  -- The unique key and conditional upsert make simultaneous clicks atomic.
  insert into public.portfolio_like_cooldowns as cooldown (visitor_hash, last_liked_at)
  values (p_visitor_hash, now())
  on conflict (visitor_hash) do update
    set last_liked_at = excluded.last_liked_at
    where cooldown.last_liked_at <= now() - interval '1 hour'
  returning last_liked_at into accepted_at;

  if accepted_at is null then
    select last_liked_at + interval '1 hour' into next_at
    from public.portfolio_like_cooldowns where visitor_hash = p_visitor_hash;
    select total into current_total from public.likes_counter where id = 1;
    return jsonb_build_object('accepted', false, 'total', current_total, 'next_allowed_at', next_at);
  end if;

  update public.likes_counter set total = total + 1 where id = 1
    returning total into current_total;
  if not found then
    raise exception 'Missing likes_counter row id=1';
  end if;
  return jsonb_build_object('accepted', true, 'total', current_total,
    'next_allowed_at', accepted_at + interval '1 hour');
end;
$$;

revoke all on function public.submit_portfolio_like(text) from public, anon, authenticated;
grant execute on function public.submit_portfolio_like(text) to service_role;
revoke insert, update, delete on public.likes_counter from public, anon, authenticated;

-- Close the old public RPC, including any overloads, without deleting it.
do $$
declare existing_rpc regprocedure;
begin
  for existing_rpc in
    select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'increment_likes'
  loop
    execute format('revoke all on function %s from public, anon, authenticated', existing_rpc);
  end loop;
end;
$$;
commit;
