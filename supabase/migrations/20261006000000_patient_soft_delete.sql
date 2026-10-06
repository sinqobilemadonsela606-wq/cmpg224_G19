-- Migration: Add soft-delete tracking to patients (corrected)
alter table public.patients
  add column if not exists deleted_at timestamp with time zone,
  add column if not exists deleted_reason text,
  add column if not exists deleted_by uuid;

-- Drop old policies if they exist
drop policy if exists "Admins can update patients" on public.patients;
drop policy if exists "Admins can read all patients" on public.patients;

-- Recreate policies
create policy "Admins can update patients"
  on public.patients
  for update
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can read all patients"
  on public.patients
  for select
  to authenticated
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

notify pgrst, 'reload schema';