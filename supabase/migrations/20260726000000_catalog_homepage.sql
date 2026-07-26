create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (
    compare_at_price is null or compare_at_price >= price
  ),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  badge text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products add column if not exists category_id uuid references public.categories(id) on delete restrict;
alter table public.products add column if not exists rating numeric(2,1) not null default 0 check (rating between 0 and 5);
alter table public.products add column if not exists review_count integer not null default 0 check (review_count >= 0);
alter table public.products add column if not exists badge text;
alter table public.products add column if not exists display_order integer not null default 0 check (display_order >= 0);
alter table public.products alter column description set default '';
update public.products set description = '' where description is null;
alter table public.products alter column description set not null;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null,
  name text not null,
  value text not null,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  stock integer not null default 0 check (stock >= 0),
  color text,
  image_url text,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, sku)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  secure_url text not null,
  public_id text,
  resource_type text not null default 'image' check (resource_type = 'image'),
  format text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  bytes integer check (bytes is null or bytes >= 0),
  alt_text text not null default '',
  color_variant_id uuid references public.product_variants(id) on delete set null,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, secure_url)
);

create unique index if not exists product_images_one_featured_idx
  on public.product_images(product_id) where is_featured;

create table if not exists public.product_information (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  value text not null,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, label)
);

create table if not exists public.product_faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, question)
);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  placement text not null check (placement in ('left', 'right')),
  title text,
  subtitle text,
  secure_url text not null,
  public_id text not null unique,
  resource_type text not null default 'image' check (resource_type = 'image'),
  format text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  bytes integer check (bytes is null or bytes >= 0),
  alt_text text not null,
  link_url text,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order between 0 and 4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.home_banner_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  secure_url text not null,
  public_id text not null unique,
  resource_type text not null default 'image' check (resource_type = 'image'),
  format text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  bytes integer check (bytes is null or bytes >= 0),
  alt_text text not null,
  link_url text,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order between 0 and 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.global_faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null unique,
  answer text not null,
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storefront_settings (
  id boolean primary key default true check (id),
  home_banner_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.storefront_settings (id, home_banner_enabled)
values (true, true)
on conflict (id) do nothing;

create index if not exists categories_active_order_idx on public.categories(is_active, display_order);
create index if not exists products_active_order_idx on public.products(is_active, display_order);
create index if not exists products_category_active_idx on public.products(category_id, is_active);
create index if not exists products_featured_idx on public.products(is_featured, is_active);
create index if not exists product_variants_product_order_idx on public.product_variants(product_id, is_active, display_order);
create index if not exists product_images_product_order_idx on public.product_images(product_id, is_active, display_order);
create index if not exists product_information_product_order_idx on public.product_information(product_id, display_order);
create index if not exists product_faqs_product_order_idx on public.product_faqs(product_id, is_active, display_order);
create index if not exists hero_slides_active_order_idx on public.hero_slides(placement, is_active, display_order);
create index if not exists home_banner_active_order_idx on public.home_banner_images(is_active, display_order);
create index if not exists global_faqs_active_order_idx on public.global_faqs(is_active, display_order);

create or replace function public.enforce_homepage_media_limit()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare existing_count integer;
begin
  if tg_table_name = 'hero_slides' then
    select count(*) into existing_count
    from public.hero_slides
    where placement = new.placement and id <> new.id;
    if existing_count >= 5 then
      raise exception 'A hero placement can contain at most five slides.';
    end if;
  elsif tg_table_name = 'home_banner_images' then
    select count(*) into existing_count
    from public.home_banner_images
    where id <> new.id;
    if existing_count >= 8 then
      raise exception 'The homepage can contain at most eight banner images.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_hero_slide_limit on public.hero_slides;
create trigger enforce_hero_slide_limit
before insert or update of placement on public.hero_slides
for each row execute function public.enforce_homepage_media_limit();

drop trigger if exists enforce_home_banner_limit on public.home_banner_images;
create trigger enforce_home_banner_limit
before insert on public.home_banner_images
for each row execute function public.enforce_homepage_media_limit();

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'categories', 'products', 'product_variants', 'product_images',
    'product_information', 'product_faqs', 'hero_slides',
    'home_banner_images', 'global_faqs', 'storefront_settings'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_information enable row level security;
alter table public.product_faqs enable row level security;
alter table public.hero_slides enable row level security;
alter table public.home_banner_images enable row level security;
alter table public.global_faqs enable row level security;
alter table public.storefront_settings enable row level security;

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories" on public.categories for select to anon, authenticated
using (is_active);

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products for select to anon, authenticated
using (
  is_active
  and exists (
    select 1 from public.categories
    where categories.id = products.category_id and categories.is_active
  )
);

drop policy if exists "Public can view active product variants" on public.product_variants;
create policy "Public can view active product variants" on public.product_variants for select to anon, authenticated
using (
  is_active
  and exists (select 1 from public.products where products.id = product_variants.product_id and products.is_active)
);

drop policy if exists "Public can view active product images" on public.product_images;
create policy "Public can view active product images" on public.product_images for select to anon, authenticated
using (
  is_active
  and exists (select 1 from public.products where products.id = product_images.product_id and products.is_active)
);

drop policy if exists "Public can view product information" on public.product_information;
create policy "Public can view product information" on public.product_information for select to anon, authenticated
using (exists (select 1 from public.products where products.id = product_information.product_id and products.is_active));

drop policy if exists "Public can view active product faqs" on public.product_faqs;
create policy "Public can view active product faqs" on public.product_faqs for select to anon, authenticated
using (
  is_active
  and exists (select 1 from public.products where products.id = product_faqs.product_id and products.is_active)
);

drop policy if exists "Public can view active hero slides" on public.hero_slides;
create policy "Public can view active hero slides" on public.hero_slides for select to anon, authenticated using (is_active);

drop policy if exists "Public can view active home banners" on public.home_banner_images;
create policy "Public can view active home banners" on public.home_banner_images for select to anon, authenticated using (is_active);

drop policy if exists "Public can view active global faqs" on public.global_faqs;
create policy "Public can view active global faqs" on public.global_faqs for select to anon, authenticated using (is_active);

drop policy if exists "Public can view storefront settings" on public.storefront_settings;
create policy "Public can view storefront settings" on public.storefront_settings for select to anon, authenticated using (true);

revoke insert, update, delete on public.categories from anon, authenticated;
revoke insert, update, delete on public.products from anon, authenticated;
revoke insert, update, delete on public.product_variants from anon, authenticated;
revoke insert, update, delete on public.product_images from anon, authenticated;
revoke insert, update, delete on public.product_information from anon, authenticated;
revoke insert, update, delete on public.product_faqs from anon, authenticated;
revoke insert, update, delete on public.hero_slides from anon, authenticated;
revoke insert, update, delete on public.home_banner_images from anon, authenticated;
revoke insert, update, delete on public.global_faqs from anon, authenticated;
revoke insert, update, delete on public.storefront_settings from anon, authenticated;

drop policy if exists "Authenticated users can upload product media" on storage.objects;
drop policy if exists "Owners can update product media" on storage.objects;
drop policy if exists "Owners can delete product media" on storage.objects;
drop policy if exists "Public can view product media" on storage.objects;
update storage.buckets set public = false where id = 'product-media';
