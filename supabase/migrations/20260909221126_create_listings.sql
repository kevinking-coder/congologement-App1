create table if not exists listings (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('buy', 'rent', 'land', 'hotel')),
  titre text not null,
  description text not null default '',
  prix_usd numeric not null default 0,
  commune text not null default '',
  adresse text not null default '',
  verified boolean not null default false,
  doc_type text not null default '',
  contact_name text not null default '',
  contact_phone text not null default '',
  photo_1 text,
  photo_2 text,
  photo_3 text,
  -- buy/rent specific
  property_type text,
  bedrooms integer,
  bathrooms integer,
  surface_m2 numeric,
  furnished boolean,
  -- land specific
  land_dimensions text,
  land_usage text,
  -- hotel specific
  stars integer,
  price_per_night_usd numeric,
  available_rooms integer,
  amenities text,
  created_at timestamptz not null default now()
);

create index if not exists listings_user_id_idx on listings(user_id);
create index if not exists listings_category_idx on listings(category);
create index if not exists listings_verified_idx on listings(verified);

alter table listings enable row level security;

drop policy if exists listings_select on listings;
create policy listings_select on listings for select using (true);

drop policy if exists listings_insert on listings;
create policy listings_insert on listings for insert with check (auth.uid() = user_id);

drop policy if exists listings_update on listings;
create policy listings_update on listings for update using (auth.uid() = user_id);

drop policy if exists listings_delete on listings;
create policy listings_delete on listings for delete using (auth.uid() = user_id);
