create extension if not exists pgcrypto;

do $$
begin
  create type vote_choice as enum ('agree', 'disagree');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  x_user_id text not null unique,
  username text not null,
  display_name text not null,
  profile_image_url text,
  x_created_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  x_user_id text not null unique references public.users (x_user_id) on delete cascade,
  vote_choice vote_choice not null,
  created_at timestamptz not null default now()
);

create index if not exists users_x_user_id_idx on public.users (x_user_id);
create index if not exists votes_created_at_idx on public.votes (created_at desc);
create index if not exists votes_vote_choice_idx on public.votes (vote_choice);
