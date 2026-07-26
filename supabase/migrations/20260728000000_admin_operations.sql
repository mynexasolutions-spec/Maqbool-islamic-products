-- Maqbool admin operations: CRM, reviews, promotions, order history and SEO.
-- Run after 20260727000000_multi_market_checkout.sql.

alter table public.categories add column if not exists image_url text;
alter table public.categories add column if not exists image_public_id text;
alter table public.categories add column if not exists image_alt_text text not null default '';
alter table public.products add column if not exists seo_title text;
alter table public.products add column if not exists seo_description text;
alter table public.orders add column if not exists customer_email text;

create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  normalized_phone text not null unique,
  email text,
  is_active boolean not null default true,
  suspension_reason text,
  first_order_at timestamptz,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, order_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  code text not null,
  discount_type text not null check (discount_type in ('percentage', 'flat')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  minimum_purchase numeric(12,2) not null default 0 check (minimum_purchase >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (market_id, code),
  check (discount_type <> 'percentage' or discount_value <= 100),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.announcements (
  id boolean primary key default true check (id),
  message text not null default '',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  id boolean primary key default true check (id),
  full_name text not null default 'Maqbool Administrator',
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null check (status in ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  note text,
  created_at timestamptz not null default now()
);

insert into public.announcements (id) values (true) on conflict (id) do nothing;
insert into public.admin_profiles (id) values (true) on conflict (id) do nothing;

create index if not exists customers_active_last_order_idx on public.customer_profiles(is_active, last_order_at desc);
create index if not exists product_reviews_status_created_idx on public.product_reviews(status, created_at desc);
create index if not exists product_reviews_product_status_idx on public.product_reviews(product_id, status);
create index if not exists coupons_market_active_idx on public.coupons(market_id, is_active);
create index if not exists order_events_order_created_idx on public.order_events(order_id, created_at);

do $$
declare table_name text;
begin
  foreach table_name in array array['customer_profiles', 'product_reviews', 'coupons', 'announcements', 'admin_profiles']
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

create or replace function public.normalize_customer_phone(value text)
returns text language sql immutable parallel safe
return regexp_replace(coalesce(value, ''), '[^0-9]', '', 'g');

create or replace function public.sync_order_customer()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare phone_value text := public.normalize_customer_phone(new.customer_phone);
begin
  insert into public.customer_profiles (
    name, phone, normalized_phone, email, first_order_at, last_order_at
  ) values (
    new.customer_name, new.customer_phone, phone_value, new.customer_email, new.created_at, new.created_at
  )
  on conflict (normalized_phone) do update set
    name = excluded.name,
    phone = excluded.phone,
    email = coalesce(excluded.email, public.customer_profiles.email),
    first_order_at = least(public.customer_profiles.first_order_at, excluded.first_order_at),
    last_order_at = greatest(public.customer_profiles.last_order_at, excluded.last_order_at);
  return new;
end;
$$;

create or replace function public.block_suspended_customer()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if exists (
    select 1 from public.customer_profiles
    where normalized_phone = public.normalize_customer_phone(new.customer_phone) and not is_active
  ) then
    raise exception 'This customer cannot place an order. Contact Maqbool support.';
  end if;
  return new;
end;
$$;

drop trigger if exists block_suspended_customer_order on public.orders;
create trigger block_suspended_customer_order before insert on public.orders
for each row execute function public.block_suspended_customer();
drop trigger if exists sync_order_customer_profile on public.orders;
create trigger sync_order_customer_profile after insert on public.orders
for each row execute function public.sync_order_customer();

insert into public.customer_profiles(name, phone, normalized_phone, email, first_order_at, last_order_at)
select max(customer_name), max(customer_phone), public.normalize_customer_phone(customer_phone),
       max(customer_email), min(created_at), max(created_at)
from public.orders
where public.normalize_customer_phone(customer_phone) <> ''
group by public.normalize_customer_phone(customer_phone)
on conflict (normalized_phone) do update set
  name = excluded.name,
  phone = excluded.phone,
  email = coalesce(excluded.email, public.customer_profiles.email),
  first_order_at = least(public.customer_profiles.first_order_at, excluded.first_order_at),
  last_order_at = greatest(public.customer_profiles.last_order_at, excluded.last_order_at);

create or replace function public.record_order_event()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.order_events(order_id, status)
    values (new.id, new.status)
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists record_order_event on public.orders;
create trigger record_order_event after insert or update of status on public.orders
for each row execute function public.record_order_event();

insert into public.order_events(order_id, status, created_at)
select id, status, created_at from public.orders o
where not exists (select 1 from public.order_events e where e.order_id = o.id);

create or replace function public.refresh_product_review_summary(product_id_input uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.products
  set rating = coalesce((
        select round(avg(rating)::numeric, 1)
        from public.product_reviews
        where product_id = product_id_input and status = 'approved'
      ), 0),
      review_count = (
        select count(*) from public.product_reviews
        where product_id = product_id_input and status = 'approved'
      )
  where id = product_id_input;
end;
$$;

create or replace function public.sync_product_review_summary()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  perform public.refresh_product_review_summary(coalesce(new.product_id, old.product_id));
  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform public.refresh_product_review_summary(old.product_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_product_review_summary on public.product_reviews;
create trigger sync_product_review_summary after insert or update or delete on public.product_reviews
for each row execute function public.sync_product_review_summary();

create or replace function public.submit_product_review(
  product_id_input uuid,
  order_number_input text,
  phone_input text,
  rating_input integer,
  body_input text
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare matched_order public.orders%rowtype;
declare review_id uuid;
begin
  if rating_input < 1 or rating_input > 5 then raise exception 'Choose a rating from 1 to 5.'; end if;
  if char_length(trim(body_input)) < 10 or char_length(trim(body_input)) > 1000 then
    raise exception 'Review must contain 10 to 1000 characters.';
  end if;
  select o.* into matched_order
  from public.orders o
  join public.order_items oi on oi.order_id = o.id and oi.product_id = product_id_input
  where upper(o.order_number) = upper(trim(order_number_input))
    and public.normalize_customer_phone(o.customer_phone) = public.normalize_customer_phone(phone_input)
  limit 1;
  if not found then raise exception 'Order number and phone could not be verified for this product.'; end if;
  insert into public.product_reviews(product_id, order_id, customer_name, customer_phone, rating, body)
  values (product_id_input, matched_order.id, matched_order.customer_name, matched_order.customer_phone, rating_input, trim(body_input))
  returning id into review_id;
  return review_id;
exception when unique_violation then
  raise exception 'A review has already been submitted for this product and order.';
end;
$$;

revoke all on function public.submit_product_review(uuid, text, text, integer, text) from public;
grant execute on function public.submit_product_review(uuid, text, text, integer, text) to anon, authenticated;

create or replace function public.place_market_order(
  market_slug_input text,
  items_input jsonb,
  customer_input jsonb,
  address_input jsonb,
  payment_method_input text,
  coupon_input text default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  selected_market public.markets%rowtype;
  settings public.market_checkout_settings%rowtype;
  selected_coupon public.coupons%rowtype;
  item jsonb;
  variant_record record;
  created_order public.orders%rowtype;
  subtotal_value numeric(12,2) := 0;
  discount_value numeric(12,2) := 0;
  shipping_value numeric(12,2) := 0;
  tax_value numeric(12,2) := 0;
  cod_value numeric(12,2) := 0;
  total_value numeric(12,2) := 0;
  quantity_value integer;
  normalized_coupon text := upper(trim(coalesce(coupon_input, '')));
begin
  if payment_method_input not in ('cod', 'online') then raise exception 'Unsupported payment method.'; end if;
  if jsonb_typeof(items_input) <> 'array' or jsonb_array_length(items_input) = 0 then raise exception 'Your bag is empty.'; end if;
  select * into selected_market from public.markets where slug = market_slug_input and is_active for share;
  if not found then raise exception 'This market is not available.'; end if;
  select * into settings from public.market_checkout_settings where market_id = selected_market.id and configuration_complete for share;
  if not found then raise exception 'Checkout is not configured for this market.'; end if;
  if payment_method_input = 'cod' and not settings.cod_enabled then raise exception 'COD is not available in this market.'; end if;
  if payment_method_input = 'online' and not settings.online_enabled then raise exception 'Online payment is not available in this market.'; end if;

  for item in select * from jsonb_array_elements(items_input) loop
    quantity_value := (item->>'quantity')::integer;
    if quantity_value <= 0 then raise exception 'Invalid item quantity.'; end if;
    select v.id, v.product_id, v.sku, v.name, v.value, v.stock, p.name product_name, p.slug product_slug,
           mp.price, pi.secure_url image_url into variant_record
    from public.product_variants v
    join public.products p on p.id = v.product_id and p.is_active
    join public.variant_market_prices mp on mp.variant_id = v.id and mp.market_id = selected_market.id and mp.is_active
    left join lateral (
      select secure_url from public.product_images
      where product_id = p.id and is_active order by is_featured desc, display_order limit 1
    ) pi on true
    where v.id = (item->>'variantId')::uuid and v.is_active for update of v;
    if not found then raise exception 'An item is unavailable in this market.'; end if;
    if variant_record.stock < quantity_value then raise exception 'Not enough stock for %.', variant_record.product_name; end if;
    subtotal_value := subtotal_value + (variant_record.price * quantity_value);
  end loop;

  if normalized_coupon <> '' then
    select * into selected_coupon from public.coupons
    where market_id = selected_market.id and upper(code) = normalized_coupon and is_active
      and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now())
      and (usage_limit is null or usage_count < usage_limit)
    for update;
    if not found then raise exception 'This coupon is not valid for the selected market.'; end if;
    if subtotal_value < selected_coupon.minimum_purchase then raise exception 'The order does not meet this coupon minimum.'; end if;
    if selected_coupon.discount_type = 'percentage' then
      discount_value := round(subtotal_value * selected_coupon.discount_value / 100, 2);
    else
      discount_value := least(subtotal_value, selected_coupon.discount_value);
    end if;
  end if;

  if settings.free_shipping_threshold is null or subtotal_value - discount_value < settings.free_shipping_threshold then shipping_value := settings.shipping_fee; end if;
  if payment_method_input = 'cod' then cod_value := settings.cod_fee; end if;
  tax_value := round(((subtotal_value - discount_value) + case when settings.tax_applies_to_shipping then shipping_value else 0 end) * settings.tax_rate / 100, 2);
  total_value := subtotal_value - discount_value + shipping_value + tax_value + cod_value;

  insert into public.orders (
    order_number, market_id, market_code, currency_code, customer_name, customer_phone, customer_email,
    delivery_address, subtotal, discount, shipping, tax_label, tax_rate, tax, cod_fee, total,
    coupon_code, payment_method, payment_status
  ) values (
    'MQB' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    selected_market.id, selected_market.code, selected_market.currency_code,
    trim(customer_input->>'name'), trim(customer_input->>'phone'), nullif(trim(customer_input->>'email'), ''),
    address_input, subtotal_value, discount_value, shipping_value, settings.tax_label, settings.tax_rate,
    tax_value, cod_value, total_value, nullif(normalized_coupon, ''), payment_method_input,
    case when payment_method_input = 'online' then 'simulated' else 'pending' end
  ) returning * into created_order;

  for item in select * from jsonb_array_elements(items_input) loop
    quantity_value := (item->>'quantity')::integer;
    select v.id, v.product_id, v.sku, v.name, v.value, p.name product_name, p.slug product_slug,
           mp.price, pi.secure_url image_url into variant_record
    from public.product_variants v
    join public.products p on p.id = v.product_id
    join public.variant_market_prices mp on mp.variant_id = v.id and mp.market_id = selected_market.id
    left join lateral (
      select secure_url from public.product_images where product_id = p.id and is_active
      order by is_featured desc, display_order limit 1
    ) pi on true where v.id = (item->>'variantId')::uuid;
    insert into public.order_items (
      order_id, product_id, variant_id, product_name, product_slug, variant_name, sku,
      image_url, unit_price, quantity, line_total
    ) values (
      created_order.id, variant_record.product_id, variant_record.id, variant_record.product_name,
      variant_record.product_slug, variant_record.name || ': ' || variant_record.value, variant_record.sku,
      variant_record.image_url, variant_record.price, quantity_value, variant_record.price * quantity_value
    );
    update public.product_variants set stock = stock - quantity_value where id = variant_record.id;
  end loop;
  if selected_coupon.id is not null then update public.coupons set usage_count = usage_count + 1 where id = selected_coupon.id; end if;

  return jsonb_build_object(
    'id', created_order.id, 'orderNumber', created_order.order_number, 'createdAt', created_order.created_at,
    'marketCode', created_order.market_code, 'currencyCode', created_order.currency_code,
    'subtotal', created_order.subtotal, 'discount', created_order.discount, 'shipping', created_order.shipping,
    'taxLabel', created_order.tax_label, 'taxRate', created_order.tax_rate, 'tax', created_order.tax,
    'codFee', created_order.cod_fee, 'total', created_order.total,
    'paymentMethod', created_order.payment_method, 'paymentStatus', created_order.payment_status, 'status', created_order.status
  );
end;
$$;

revoke all on function public.place_market_order(text, jsonb, jsonb, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.place_market_order(text, jsonb, jsonb, jsonb, text, text) to service_role;

alter table public.customer_profiles enable row level security;
alter table public.product_reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.announcements enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.order_events enable row level security;

drop policy if exists "Public can view approved reviews" on public.product_reviews;
create policy "Public can view approved reviews" on public.product_reviews for select to anon, authenticated using (status = 'approved');
drop policy if exists "Public can view active announcement" on public.announcements;
create policy "Public can view active announcement" on public.announcements for select to anon, authenticated using (is_active);

revoke all on public.customer_profiles from anon, authenticated;
revoke insert, update, delete on public.product_reviews from anon, authenticated;
revoke all on public.coupons from anon, authenticated;
revoke insert, update, delete on public.announcements from anon, authenticated;
revoke all on public.admin_profiles from anon, authenticated;
revoke all on public.order_events from anon, authenticated;
grant select on public.product_reviews to anon, authenticated;
grant select on public.announcements to anon, authenticated;
