-- Supabase/PostgreSQL database structure for Shop Expiration Tracker
create extension if not exists "pgcrypto";

create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  full_name text,
  role text not null default 'employee' check (role in ('owner','manager','employee')),
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  barcode text,
  category text not null,
  shelf_location text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_shop_barcode_idx on products(shop_id, barcode);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  expiry_date date not null,
  batch_number text,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists batches_expiry_idx on batches(expiry_date);
create index if not exists batches_product_idx on batches(product_id);

create table if not exists reminder_settings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  days_before integer not null check (days_before >= 0),
  enabled boolean not null default true,
  unique(shop_id, days_before)
);

-- Recommended default reminders:
-- 30, 7, 3 and 1 days before expiry.

-- Later, a scheduled job can query:
-- select * from batches where expiry_date between current_date and current_date + 7;
