create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient','doctor','pharmacy','lab','ambulance','responder','nursing_home')),
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.doctor_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  department text not null,
  specialty text,
  registration_number text,
  experience_years integer default 0,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','suspended')),
  online_available boolean not null default false,
  doorstep_available boolean not null default false,
  service_radius_km numeric(6,2),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id),
  doctor_id uuid not null references public.doctor_profiles(id),
  appointment_date date not null,
  appointment_time time not null,
  mode text not null check (mode in ('virtual','clinic','doorstep')),
  status text not null default 'requested' check (status in ('requested','accepted','declined','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.sos_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id),
  service text not null check (service in ('doctor','ambulance','pharmacy','responder')),
  latitude double precision,
  longitude double precision,
  status text not null default 'broadcasting' check (status in ('broadcasting','accepted','en_route','arrived','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.sos_requests enable row level security;

-- Production note: add narrowly scoped RLS policies before enabling real patient data.
-- Do not expose medical records or emergency data with public/anonymous policies.
