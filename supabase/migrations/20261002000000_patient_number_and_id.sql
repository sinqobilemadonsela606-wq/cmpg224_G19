-- Migration: Add patient_number, id_number, and is_active to patients
-- Date: 2026-10-02
-- Author: Ruhiiga Basiji
-- Related FRs: FR05, FR06, FR07, FR08, FR12
--
-- Adds:
--   patient_number  → auto-generated PAT-0001, PAT-0002 (human-readable ID)
--   id_number       → SA ID number (13 digits, entered by receptionist)
--   is_active       → soft-delete flag (FR08)

-- =========================================================
-- 1. Add new columns
-- =========================================================
alter table public.patients
  add column if not exists patient_number text unique,
  add column if not exists id_number text unique,
  add column if not exists is_active boolean default true;

-- =========================================================
-- 2. Create a sequence for patient numbers
-- =========================================================
create sequence if not exists public.patient_number_seq start 1;

-- =========================================================
-- 3. Trigger function: auto-assign patient_number on insert
-- =========================================================
create or replace function public.set_patient_number()
returns trigger as $$
begin
  if new.patient_number is null then
    new.patient_number := 'PAT-' || lpad(nextval('public.patient_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

-- =========================================================
-- 4. Attach trigger to patients table
-- =========================================================
drop trigger if exists trg_set_patient_number on public.patients;
create trigger trg_set_patient_number
  before insert on public.patients
  for each row
  execute function public.set_patient_number();

-- =========================================================
-- 5. Backfill existing patients with patient_numbers
-- =========================================================
update public.patients
set patient_number = 'PAT-' || lpad(nextval('public.patient_number_seq')::text, 4, '0')
where patient_number is null;


-- 6. Reload API cache
notify pgrst, 'reload schema';