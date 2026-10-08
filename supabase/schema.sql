-- DIOKA ATELIER · SUPABASE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Profiles table (synced with auth or custom user profiles)
create table if not exists public.dioka_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id text unique,
  email text not null,
  full_name text,
  phone text,
  shipping_address jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Specialized Carts table (persists user carts across devices)
create table if not exists public.dioka_carts (
  id uuid primary key default uuid_generate_v4(),
  user_id text unique not null,
  items jsonb default '[]'::jsonb not null,
  currency text default 'USD' not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Customer Orders table (records completed atelier purchases)
create table if not exists public.dioka_orders (
  id uuid primary key default uuid_generate_v4(),
  order_id text unique not null,
  user_id text,
  customer_name text not null,
  customer_email text not null,
  shipping_address text not null,
  items jsonb default '[]'::jsonb not null,
  total_amount numeric(12, 2) not null,
  currency text default 'USD' not null,
  status text default 'confirmed' not null,
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security (RLS)
alter table public.dioka_profiles enable row level security;
alter table public.dioka_carts enable row level security;
alter table public.dioka_orders enable row level security;

-- Allow public / anon operations for seamless guest & shopper flows
create policy "Allow all operations on dioka_profiles"
  on public.dioka_profiles for all
  using (true)
  with check (true);

create policy "Allow all operations on dioka_carts"
  on public.dioka_carts for all
  using (true)
  with check (true);

create policy "Allow all operations on dioka_orders"
  on public.dioka_orders for all
  using (true)
  with check (true);

-- 6. Indexes for ultra-fast lookup
create index if not exists idx_dioka_carts_user_id on public.dioka_carts (user_id);
create index if not exists idx_dioka_orders_user_id on public.dioka_orders (user_id);
create index if not exists idx_dioka_orders_order_id on public.dioka_orders (order_id);
