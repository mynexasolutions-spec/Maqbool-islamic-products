-- Maqbool multi-market pricing and checkout.
-- Run after 20260726000000_catalog_homepage.sql.

create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z][A-Z0-9-]*$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  country_code text not null check (char_length(country_code) = 2),
  currency_code text not null check (char_length(currency_code) = 3),
  locale text not null,
  currency_minor_unit smallint not null default 2 check (currency_minor_unit between 0 and 3),
  is_active boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.market_checkout_settings (
  market_id uuid primary key references public.markets(id) on delete cascade,
  tax_label text not null default 'Tax',
  tax_rate numeric(7,4) not null default 0 check (tax_rate between 0 and 100),
  tax_applies_to_shipping boolean not null default false,
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  free_shipping_threshold numeric(12,2) check (free_shipping_threshold is null or free_shipping_threshold >= 0),
  cod_fee numeric(12,2) not null default 0 check (cod_fee >= 0),
  cod_enabled boolean not null default true,
  online_enabled boolean not null default true,
  delivery_estimate text not null default '3–7 business days',
  configuration_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.variant_market_prices (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (variant_id, market_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  market_id uuid not null references public.markets(id) on delete restrict,
  market_code text not null,
  currency_code text not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address jsonb not null,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  shipping numeric(12,2) not null default 0 check (shipping >= 0),
  tax_label text not null,
  tax_rate numeric(7,4) not null check (tax_rate >= 0),
  tax numeric(12,2) not null default 0 check (tax >= 0),
  cod_fee numeric(12,2) not null default 0 check (cod_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  coupon_code text,
  payment_method text not null check (payment_method in ('cod', 'online')),
  payment_status text not null check (payment_status in ('pending', 'simulated', 'paid', 'failed', 'refunded')),
  status text not null default 'confirmed' check (status in ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  stock_restored_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  variant_name text not null,
  sku text not null,
  image_url text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

insert into public.markets
  (code, slug, name, country_code, currency_code, locale, is_active, display_order)
values
  ('IN', 'in', 'India', 'IN', 'INR', 'en-IN', true, 0),
  ('SA', 'sa', 'Saudi Arabia', 'SA', 'SAR', 'en-SA', false, 1),
  ('AE-DXB', 'dubai', 'Dubai', 'AE', 'AED', 'en-AE', false, 2),
  ('MY', 'my', 'Malaysia', 'MY', 'MYR', 'en-MY', false, 3),
  ('QA', 'qa', 'Qatar', 'QA', 'QAR', 'en-QA', false, 4)
on conflict (code) do update set
  slug = excluded.slug,
  name = excluded.name,
  country_code = excluded.country_code,
  currency_code = excluded.currency_code,
  locale = excluded.locale,
  display_order = excluded.display_order;

insert into public.market_checkout_settings
  (market_id, tax_label, tax_rate, shipping_fee, free_shipping_threshold, cod_fee, cod_enabled, online_enabled, delivery_estimate, configuration_complete)
select id, 'Tax', 0, 79, 999, 39, true, true, '3–7 business days', true
from public.markets where code = 'IN'
on conflict (market_id) do nothing;

insert into public.market_checkout_settings (market_id)
select id from public.markets
on conflict (market_id) do nothing;

insert into public.variant_market_prices (variant_id, market_id, price, compare_at_price, is_active)
select variants.id, markets.id, variants.price, variants.compare_at_price, variants.is_active
from public.product_variants variants
cross join public.markets markets
where markets.code = 'IN'
on conflict (variant_id, market_id) do nothing;

create index if not exists markets_active_order_idx on public.markets(is_active, display_order);
create index if not exists variant_market_prices_market_variant_idx on public.variant_market_prices(market_id, variant_id, is_active);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_market_status_idx on public.orders(market_id, status, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

drop trigger if exists set_markets_updated_at on public.markets;
create trigger set_markets_updated_at before update on public.markets
for each row execute function public.set_updated_at();
drop trigger if exists set_market_checkout_settings_updated_at on public.market_checkout_settings;
create trigger set_market_checkout_settings_updated_at before update on public.market_checkout_settings
for each row execute function public.set_updated_at();
drop trigger if exists set_variant_market_prices_updated_at on public.variant_market_prices;
create trigger set_variant_market_prices_updated_at before update on public.variant_market_prices
for each row execute function public.set_updated_at();
drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.markets enable row level security;
alter table public.market_checkout_settings enable row level security;
alter table public.variant_market_prices enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Public can view active markets" on public.markets;
create policy "Public can view active markets" on public.markets for select to anon, authenticated using (is_active);
drop policy if exists "Public can view active market checkout settings" on public.market_checkout_settings;
create policy "Public can view active market checkout settings" on public.market_checkout_settings for select to anon, authenticated
using (exists (select 1 from public.markets where markets.id = market_checkout_settings.market_id and markets.is_active));
drop policy if exists "Public can view active market prices" on public.variant_market_prices;
create policy "Public can view active market prices" on public.variant_market_prices for select to anon, authenticated
using (
  is_active
  and exists (select 1 from public.markets where markets.id = variant_market_prices.market_id and markets.is_active)
  and exists (select 1 from public.product_variants where product_variants.id = variant_market_prices.variant_id and product_variants.is_active)
);

revoke insert, update, delete on public.markets from anon, authenticated;
revoke insert, update, delete on public.market_checkout_settings from anon, authenticated;
revoke insert, update, delete on public.variant_market_prices from anon, authenticated;
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;

create or replace function public.place_market_order(
  market_slug_input text,
  items_input jsonb,
  customer_input jsonb,
  address_input jsonb,
  payment_method_input text,
  coupon_input text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_market public.markets%rowtype;
  settings public.market_checkout_settings%rowtype;
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

  for item in select * from jsonb_array_elements(items_input)
  loop
    quantity_value := (item->>'quantity')::integer;
    if quantity_value <= 0 then raise exception 'Invalid item quantity.'; end if;
    select v.id, v.product_id, v.sku, v.name, v.value, v.stock, p.name product_name, p.slug product_slug,
           mp.price, pi.secure_url image_url
      into variant_record
      from public.product_variants v
      join public.products p on p.id = v.product_id and p.is_active
      join public.variant_market_prices mp on mp.variant_id = v.id and mp.market_id = selected_market.id and mp.is_active
      left join lateral (
        select secure_url from public.product_images
        where product_id = p.id and is_active order by is_featured desc, display_order limit 1
      ) pi on true
      where v.id = (item->>'variantId')::uuid and v.is_active
      for update of v;
    if not found then raise exception 'An item is unavailable in this market.'; end if;
    if variant_record.stock < quantity_value then raise exception 'Not enough stock for %.', variant_record.product_name; end if;
    subtotal_value := subtotal_value + (variant_record.price * quantity_value);
  end loop;

  if normalized_coupon = 'MAQBOOL10' then discount_value := round(subtotal_value * 0.10, 2); end if;
  if settings.free_shipping_threshold is null or subtotal_value - discount_value < settings.free_shipping_threshold then
    shipping_value := settings.shipping_fee;
  end if;
  if payment_method_input = 'cod' then cod_value := settings.cod_fee; end if;
  tax_value := round(((subtotal_value - discount_value) + case when settings.tax_applies_to_shipping then shipping_value else 0 end) * settings.tax_rate / 100, 2);
  total_value := subtotal_value - discount_value + shipping_value + tax_value + cod_value;

  insert into public.orders (
    order_number, market_id, market_code, currency_code, customer_name, customer_phone, delivery_address,
    subtotal, discount, shipping, tax_label, tax_rate, tax, cod_fee, total, coupon_code,
    payment_method, payment_status
  ) values (
    'MQB' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    selected_market.id, selected_market.code, selected_market.currency_code,
    trim(customer_input->>'name'), trim(customer_input->>'phone'), address_input,
    subtotal_value, discount_value, shipping_value, settings.tax_label, settings.tax_rate, tax_value,
    cod_value, total_value, nullif(normalized_coupon, ''), payment_method_input,
    case when payment_method_input = 'online' then 'simulated' else 'pending' end
  ) returning * into created_order;

  for item in select * from jsonb_array_elements(items_input)
  loop
    quantity_value := (item->>'quantity')::integer;
    select v.id, v.product_id, v.sku, v.name, v.value, p.name product_name, p.slug product_slug,
           mp.price, pi.secure_url image_url
      into variant_record
      from public.product_variants v
      join public.products p on p.id = v.product_id
      join public.variant_market_prices mp on mp.variant_id = v.id and mp.market_id = selected_market.id
      left join lateral (
        select secure_url from public.product_images
        where product_id = p.id and is_active order by is_featured desc, display_order limit 1
      ) pi on true
      where v.id = (item->>'variantId')::uuid;
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

create or replace function public.set_market_order_status(order_id_input uuid, status_input text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare selected_order public.orders%rowtype;
declare item record;
begin
  if status_input not in ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Unsupported order status.';
  end if;
  select * into selected_order from public.orders where id = order_id_input for update;
  if not found then raise exception 'Order not found.'; end if;
  if selected_order.status = 'cancelled' and status_input <> 'cancelled' then
    raise exception 'A cancelled order cannot be reopened.';
  end if;
  if status_input = 'cancelled' and selected_order.stock_restored_at is null then
    for item in select variant_id, quantity from public.order_items where order_id = order_id_input and variant_id is not null
    loop
      update public.product_variants set stock = stock + item.quantity where id = item.variant_id;
    end loop;
    update public.orders set stock_restored_at = now() where id = order_id_input;
  end if;
  update public.orders set status = status_input where id = order_id_input;
end;
$$;

revoke all on function public.set_market_order_status(uuid, text) from public, anon, authenticated;
grant execute on function public.set_market_order_status(uuid, text) to service_role;
