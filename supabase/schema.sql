-- Historical Archive schema. Run once in the Supabase SQL Editor.
-- Read-only to the public: SELECT-only RLS, no auth, no user accounts.

create table if not exists categories (
  slug text primary key,
  name text not null,
  numeral text not null,
  note text not null,
  intro text not null
);

create table if not exists entries (
  id text primary key,
  slug text unique not null,
  title text not null,
  subtitle text,
  category_slug text not null references categories (slug),
  subcategory text,
  start_date text not null,
  end_date text,
  location text,
  country text,
  latitude double precision not null,
  longitude double precision not null,
  approximate boolean not null default true,
  short_description text not null,
  overview text not null,
  historical_context text,
  causes jsonb not null default '[]',
  key_events jsonb not null default '[]',
  consequences jsonb not null default '[]',
  lesser_known_facts jsonb not null default '[]',
  legacy text,
  historical_significance text,
  hero_image text not null,
  tags jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists people (
  id serial primary key,
  name text unique not null,
  role text,
  description text
);

create table if not exists entry_people (
  entry_slug text not null references entries (slug) on delete cascade,
  person_name text not null references people (name) on delete cascade,
  role text,
  target_slug text,
  primary key (entry_slug, person_name)
);

create table if not exists entry_related (
  entry_slug text not null references entries (slug) on delete cascade,
  related_slug text not null references entries (slug) on delete cascade,
  position integer not null default 0,
  primary key (entry_slug, related_slug)
);

create table if not exists timeline_events (
  id serial primary key,
  entry_slug text not null references entries (slug) on delete cascade,
  date text not null,
  title text not null,
  description text,
  position integer not null default 0
);

create table if not exists entry_images (
  id serial primary key,
  entry_slug text not null references entries (slug) on delete cascade,
  url text not null,
  alt text,
  caption text,
  credit text,
  position integer not null default 0
);

create table if not exists sources (
  id serial primary key,
  entry_slug text not null references entries (slug) on delete cascade,
  title text not null,
  url text,
  publisher text
);

create index if not exists entries_slug_idx on entries (slug);
create index if not exists entries_category_idx on entries (category_slug);
create index if not exists timeline_entry_idx on timeline_events (entry_slug, position);

alter table categories enable row level security;
alter table entries enable row level security;
alter table people enable row level security;
alter table entry_people enable row level security;
alter table entry_related enable row level security;
alter table timeline_events enable row level security;
alter table entry_images enable row level security;
alter table sources enable row level security;

drop policy if exists "public read" on categories;
drop policy if exists "public read" on entries;
drop policy if exists "public read" on people;
drop policy if exists "public read" on entry_people;
drop policy if exists "public read" on entry_related;
drop policy if exists "public read" on timeline_events;
drop policy if exists "public read" on entry_images;
drop policy if exists "public read" on sources;

create policy "public read" on categories for select using (true);
create policy "public read" on entries for select using (true);
create policy "public read" on people for select using (true);
create policy "public read" on entry_people for select using (true);
create policy "public read" on entry_related for select using (true);
create policy "public read" on timeline_events for select using (true);
create policy "public read" on entry_images for select using (true);
create policy "public read" on sources for select using (true);
