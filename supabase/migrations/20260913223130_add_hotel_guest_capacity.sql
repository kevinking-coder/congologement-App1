alter table listings add column if not exists max_adults integer;
alter table listings add column if not exists children_allowed boolean not null default false;
alter table listings add column if not exists max_children integer;
