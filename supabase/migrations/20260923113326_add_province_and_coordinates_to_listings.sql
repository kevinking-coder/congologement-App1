alter table listings add column if not exists province text not null default '';
alter table listings add column if not exists latitude numeric;
alter table listings add column if not exists longitude numeric;

create index if not exists listings_province_idx on listings(province);
