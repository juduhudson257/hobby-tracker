create table if not exists public.habits (
  id text primary key,
  user_id text not null,
  name text not null,
  category text not null,
  color text not null,
  completed_dates text[] not null default '{}',
  created_at_str text not null
);

create index if not exists habits_user_id_idx on public.habits (user_id);

alter table public.habits enable row level security;
