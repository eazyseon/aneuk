create extension if not exists pgcrypto;

create table if not exists public.room_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  visited_at date not null,
  district_name text not null check (char_length(trim(district_name)) > 0),
  nickname text,
  address text,
  latitude double precision,
  longitude double precision,
  monthly_rent integer check (monthly_rent is null or monthly_rent >= 0),
  maintenance_fee integer check (maintenance_fee is null or maintenance_fee >= 0),
  water_pressure text check (
    water_pressure is null or water_pressure in ('good', 'okay', 'bad')
  ),
  sunlight text check (
    sunlight is null or sunlight in ('good', 'okay', 'bad')
  ),
  noise text check (
    noise is null or noise in ('good', 'okay', 'bad')
  ),
  sanitation text check (
    sanitation is null or sanitation in ('good', 'okay', 'bad')
  ),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint room_records_latitude_range check (
    latitude is null or latitude between -90 and 90
  ),
  constraint room_records_longitude_range check (
    longitude is null or longitude between -180 and 180
  )
);

create index if not exists room_records_user_id_visited_at_idx
  on public.room_records (user_id, visited_at desc, created_at desc);

create or replace function public.set_room_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists room_records_set_updated_at on public.room_records;

create trigger room_records_set_updated_at
before update on public.room_records
for each row
execute function public.set_room_records_updated_at();

alter table public.room_records enable row level security;

drop policy if exists "room_records_select_own" on public.room_records;
create policy "room_records_select_own"
on public.room_records
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "room_records_insert_own" on public.room_records;
create policy "room_records_insert_own"
on public.room_records
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "room_records_update_own" on public.room_records;
create policy "room_records_update_own"
on public.room_records
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "room_records_delete_own" on public.room_records;
create policy "room_records_delete_own"
on public.room_records
for delete
to authenticated
using (auth.uid() = user_id);
