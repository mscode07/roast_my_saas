create table if not exists roasts (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  domain text not null,
  website_name text not null,
  roast_mode text not null check (roast_mode in ('easy', 'normal', 'hard')),
  overall_score smallint not null check (overall_score between 0 and 100),
  clarity_score smallint not null check (clarity_score between 0 and 10),
  audience_score smallint not null check (audience_score between 0 and 10),
  value_score smallint not null check (value_score between 0 and 10),
  trust_score smallint not null check (trust_score between 0 and 10),
  cta_score smallint not null check (cta_score between 0 and 10),
  verdict text not null,
  share_quote text not null,
  result jsonb not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists roasts_leaderboard_idx
  on roasts (overall_score asc, created_at desc)
  where is_public = true;

-- A domain gets one permanent leaderboard slot. Keep the newest existing
-- result before enforcing uniqueness, then update that row on future roasts.
with ranked as (
  select id, row_number() over (
    partition by lower(domain)
    order by created_at desc, id desc
  ) as duplicate_rank
  from roasts
)
delete from roasts
where id in (select id from ranked where duplicate_rank > 1);

create unique index if not exists roasts_domain_unique_idx
  on roasts (lower(domain));
