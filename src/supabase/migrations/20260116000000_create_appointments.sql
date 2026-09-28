-- Migration: Create practitioners and appointments tables
-- Date: 2026-09-28
-- Author: Ruhiiga Basiji (Backend/Lead)
-- Related FRs: FR09, FR10, FR11, FR12, FR13, FR14, FR15
--
-- Purpose: Baseline schema for CASS appointment scheduling.
-- Practitioners are reference data (no login — indirect stakeholders).
-- Appointments link a patient to a practitioner at a date/time.


-- 1. PRACTITIONERS

create table if not exists public.practitioners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  specialty text,
  available_days text[],              -- e.g. {'Mon','Tue','Wed'}
  available_start time,
  available_end time,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.practitioners enable row level security;

drop policy if exists "Allow anon select on practitioners" on public.practitioners;
create policy "Allow anon select on practitioners"
  on public.practitioners
  for select
  to anon, authenticated
  using (true);

grant select, insert, update, delete
  on public.practitioners
  to anon, authenticated;

-- 2. APPOINTMENTS

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  practitioner_id uuid not null references public.practitioners(id),
  appointment_date date not null,
  appointment_time time not null,
  reason text,
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','cancelled','rescheduled')),
  cancellation_reason text,
  created_by uuid,                    -- receptionist user id (added in FR01)
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Prevent double-booking the same practitioner at the same date/time
  unique (practitioner_id, appointment_date, appointment_time)
);

alter table public.appointments enable row level security;

drop policy if exists "Allow anon all on appointments" on public.appointments;
create policy "Allow anon all on appointments"
  on public.appointments
  for all
  to anon, authenticated
  using (true)
  with check (true);

grant select, insert, update, delete
  on public.appointments
  to anon, authenticated;


-- 3. SEED SAMPLE PRACTITIONERS (so the booking form has data)

insert into public.practitioners (full_name, specialty, available_days, available_start, available_end)
values
  ('Dr. A. Mokoena',   'General Practitioner',  '{Mon,Tue,Wed,Thu,Fri}',   '08:00', '16:00'),
  ('Dr. T. Nkosi',     'Pediatrics',            '{Mon,Wed,Fri}',           '09:00', '15:00'),
  ('Dr. L. van Wyk',   'Optometrist',           '{Tue,Thu}',               '10:00', '14:00'),
  ('Dr. K. Mbatha',    'Gynecologist',          '{Mon,Tue,Thu,Fri}',       '10:00', '14:00'), 
  ('Dr. P. Mohini',    'Dentist',               '{Mon,Tue,Thu,Fri}',       '10:00', '14:00')
on conflict do nothing;

-- 4. RELOAD API SCHEMA CACHE
notify pgrst, 'reload schema';