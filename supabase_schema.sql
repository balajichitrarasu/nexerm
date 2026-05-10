-- ═══════════════════════════════════════════════
--  NexERM — Supabase Database Schema
--  Run this entire file in: Supabase → SQL Editor
-- ═══════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── COMPANY ──────────────────────────────────
create table if not exists company (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null default 'My Company',
  industry   text,
  timezone   text default 'Asia/Kolkata',
  created_at timestamptz default now()
);
insert into company (name, industry) values ('My Company', 'Technology') on conflict do nothing;

-- ── DEPARTMENTS ───────────────────────────────
create table if not exists departments (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  head       text,
  color      text default '#2563EB',
  created_at timestamptz default now()
);

-- ── SHIFTS ────────────────────────────────────
create table if not exists shifts (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  start      text not null,
  "end"      text not null,
  color      text default '#2563EB',
  created_at timestamptz default now()
);

-- ── EMPLOYEES ─────────────────────────────────
create table if not exists employees (
  id              text primary key,  -- e.g. EMP001
  first           text not null,
  last            text not null,
  email           text unique not null,
  phone           text,
  dept_id         uuid references departments(id) on delete set null,
  shift_id        uuid references shifts(id) on delete set null,
  role            text,
  salary_per_day  numeric(10,2) default 0,
  status          text default 'Active' check (status in ('Active','Inactive')),
  join_date       date,
  gender          text,
  blood           text,
  created_at      timestamptz default now()
);

-- ── ATTENDANCE ────────────────────────────────
create table if not exists attendance (
  id            uuid primary key default uuid_generate_v4(),
  date          date not null,
  emp_id        text references employees(id) on delete cascade,
  check_in      text,
  check_out     text,
  status        text default 'Absent' check (status in ('Present','Absent','On Leave','Late','Half Day')),
  overtime_hrs  numeric(5,2) default 0,
  note          text,
  created_at    timestamptz default now(),
  unique(date, emp_id)
);

-- ── LEAVES ────────────────────────────────────
create table if not exists leaves (
  id          uuid primary key default uuid_generate_v4(),
  emp_id      text references employees(id) on delete cascade,
  type        text not null,
  from_date   date not null,
  to_date     date not null,
  days        integer not null default 1,
  reason      text,
  status      text default 'Pending' check (status in ('Pending','Approved','Rejected')),
  applied_on  date default current_date,
  created_at  timestamptz default now()
);

-- ── ACTIVITY ──────────────────────────────────
create table if not exists activity (
  id         uuid primary key default uuid_generate_v4(),
  text       text not null,
  detail     text,
  color      text default '#2563EB',
  time       text,
  created_at timestamptz default now()
);

-- ── SETTINGS ──────────────────────────────────
create table if not exists settings (
  id           uuid primary key default uuid_generate_v4(),
  company_name text default 'My Company',
  work_hours   numeric default 8,
  ot_rate      numeric default 1.5,
  pf_percent   numeric default 12,
  tax_percent  numeric default 5,
  leave_days   integer default 24,
  currency     text default '₹',
  updated_at   timestamptz default now()
);
insert into settings (company_name) values ('My Company') on conflict do nothing;

-- ── ROW LEVEL SECURITY ────────────────────────
-- Enable RLS on all tables
alter table company     enable row level security;
alter table departments enable row level security;
alter table shifts      enable row level security;
alter table employees   enable row level security;
alter table attendance  enable row level security;
alter table leaves      enable row level security;
alter table activity    enable row level security;
alter table settings    enable row level security;

-- Allow authenticated users full access to all tables
create policy "auth_all_company"     on company     for all to authenticated using (true) with check (true);
create policy "auth_all_departments" on departments for all to authenticated using (true) with check (true);
create policy "auth_all_shifts"      on shifts      for all to authenticated using (true) with check (true);
create policy "auth_all_employees"   on employees   for all to authenticated using (true) with check (true);
create policy "auth_all_attendance"  on attendance  for all to authenticated using (true) with check (true);
create policy "auth_all_leaves"      on leaves      for all to authenticated using (true) with check (true);
create policy "auth_all_activity"    on activity    for all to authenticated using (true) with check (true);
create policy "auth_all_settings"    on settings    for all to authenticated using (true) with check (true);

-- ── INDEXES (performance) ─────────────────────
create index if not exists idx_attendance_date   on attendance(date);
create index if not exists idx_attendance_emp_id on attendance(emp_id);
create index if not exists idx_leaves_emp_id     on leaves(emp_id);
create index if not exists idx_leaves_status     on leaves(status);
create index if not exists idx_employees_status  on employees(status);
create index if not exists idx_employees_dept    on employees(dept_id);

-- Done! ✅
