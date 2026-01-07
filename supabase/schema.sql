-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. VEHICLES TABLE
create table if not exists vehicles (
  id uuid default uuid_generate_v4() primary key,
  plate_number text unique not null,
  vehicle_type text not null, -- 'TRACTOR', 'TRAILER', 'DOLLY'
  carrier_company text default 'SIMSA',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. INSPECTIONS TABLE
create table if not exists inspections (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references vehicles(id),
  inspection_type text not null, -- 'ENTRY', 'EXIT'
  status text not null, -- 'CLEAN', 'DAMAGE_DETECTED', 'MAINTENANCE_REQ'
  ai_summary text,
  image_url text, -- Main evidence image
  location text default 'Torreón Terminal',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. DAMAGE LOGS (Detailed findings)
create table if not exists damage_logs (
  id uuid default uuid_generate_v4() primary key,
  inspection_id uuid references inspections(id),
  severity text not null, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  component text not null, -- 'TIRE', 'BUMPER', 'LIGHTS', etc.
  description text,
  confidence_score float,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS (Row Level Security)
alter table vehicles enable row level security;
alter table inspections enable row level security;
alter table damage_logs enable row level security;

-- Policies (Drop first to avoid duplication errors)
drop policy if exists "Enable all access for demo" on vehicles;
drop policy if exists "Enable all access for demo" on inspections;
drop policy if exists "Enable all access for demo" on damage_logs;

create policy "Enable all access for demo" on vehicles for all using (true);
create policy "Enable all access for demo" on inspections for all using (true);
create policy "Enable all access for demo" on damage_logs for all using (true);
