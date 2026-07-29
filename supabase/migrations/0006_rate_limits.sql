-- 0006_rate_limits.sql — durable, race-safe rate limiting for the public API.
-- A fixed-window counter that survives serverless cold starts (in-memory limiters
-- don't, because each invocation may be a fresh process). Used to throttle image
-- generation and public form spam by IP and by lead.

create table if not exists public.rate_limits (
  key          text        not null,
  window_start timestamptz not null,
  count        integer     not null default 0,
  primary key (key, window_start)
);

alter table public.rate_limits enable row level security;
-- Intentionally no policies: only the SECURITY DEFINER function below (called by
-- the server with the service role) ever touches this table.

-- rate_limit_hit records one hit against p_key in the current fixed window and
-- returns true if the request is ALLOWED (count still within p_max), false if the
-- limit is exceeded. Atomic via INSERT ... ON CONFLICT ... RETURNING.
create or replace function public.rate_limit_hit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count  integer;
begin
  -- Snap to the start of the current fixed window.
  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.rate_limits as rl (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
    do update set count = rl.count + 1
  returning rl.count into v_count;

  return v_count <= p_max;
end;
$$;

grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

-- Housekeeping: drop counters older than a day. Call from a scheduled job if you
-- enable pg_cron, or ignore — the table stays tiny either way.
create or replace function public.rate_limits_gc()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;

grant execute on function public.rate_limits_gc() to service_role;
