create table if not exists reports (
  id text primary key,
  listing_id text not null references listings(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reason text not null,
  details text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists reports_listing_id_idx on reports(listing_id);
create index if not exists reports_user_id_idx on reports(user_id);

alter table reports enable row level security;

drop policy if exists reports_select on reports;
create policy reports_select on reports for select using (auth.uid() = user_id);

drop policy if exists reports_insert on reports;
create policy reports_insert on reports for insert with check (auth.uid() = user_id);
