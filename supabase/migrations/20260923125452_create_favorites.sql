create table if not exists favorites (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  listing_id text not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists favorites_user_id_idx on favorites(user_id);
create index if not exists favorites_listing_id_idx on favorites(listing_id);

alter table favorites enable row level security;

drop policy if exists favorites_select on favorites;
create policy favorites_select on favorites for select using (auth.uid() = user_id);

drop policy if exists favorites_insert on favorites;
create policy favorites_insert on favorites for insert with check (auth.uid() = user_id);

drop policy if exists favorites_delete on favorites;
create policy favorites_delete on favorites for delete using (auth.uid() = user_id);
