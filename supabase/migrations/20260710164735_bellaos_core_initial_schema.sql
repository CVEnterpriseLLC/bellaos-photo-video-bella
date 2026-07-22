create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  slug text,
  created_at timestamptz default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key,
  full_name text,
  email text unique,
  brand_id uuid references brands(id),
  role_id uuid references roles(id),
  created_at timestamptz default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id),
  first_name text not null,
  last_name text,
  email text,
  phone text,
  event_type text,
  event_date date,
  status text default 'lead',
  created_at timestamptz default now()
);
