create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2),
  image_url text,
  category text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  order_id text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.contact_messages enable row level security;

create policy "Public can view active products"
on public.products for select
using (is_active = true);

create policy "Anyone can submit contact messages"
on public.contact_messages for insert
with check (true);

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do update set public = excluded.public;

create policy "Public can view product media"
on storage.objects for select
using (bucket_id = 'product-media');

create policy "Authenticated users can upload product media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Owners can update product media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Owners can delete product media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-media'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
