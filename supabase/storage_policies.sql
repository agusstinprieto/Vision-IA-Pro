-- Enable Storage Extension (if not enabled)
-- create extension if not exists "storage" schema "extensions";

-- 1. Create the 'evidence-vault' bucket
insert into storage.buckets (id, name, public)
values ('evidence-vault', 'evidence-vault', true)
on conflict (id) do nothing;

-- 2. Security Policies for 'evidence-vault'

-- Allow Public Access to Read (Viewing Evidence)
create policy "Public Access Evidence"
  on storage.objects for select
  using ( bucket_id = 'evidence-vault' );

-- Allow Authenticated/Public Uploads (For Development/Simulation)
-- In production, restrict this to authenticated users
create policy "Upload Evidence"
  on storage.objects for insert
  with check ( bucket_id = 'evidence-vault' );

-- Allow Updates (Overwrite if needed)
create policy "Update Evidence"
  on storage.objects for update
  using ( bucket_id = 'evidence-vault' );

-- 3. Explanation of Folder Structure (Logical Only)
-- Supabase Storage folders are virtual. We will use paths like:
-- /operarios/driver_id_timestamp.jpg
-- /incidencias/report_id_timestamp.jpg
-- /llantas/unit_id_timestamp.jpg
