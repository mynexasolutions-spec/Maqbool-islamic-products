-- Regression fixes: live inquiry workflow and complete international price coverage.
-- Safe to run repeatedly.

create extension if not exists "pgcrypto";

-- Some projects started from the catalog migration and never ran the legacy
-- initial schema, where this table originally lived. Create it here as well so
-- this migration is safe in either migration history.
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

alter table public.contact_messages
  add column if not exists status text not null default 'new',
  add column if not exists admin_note text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contact_messages_status_check'
      and conrelid = 'public.contact_messages'::regclass
  ) then
    alter table public.contact_messages
      add constraint contact_messages_status_check
      check (status in ('new', 'open', 'resolved'));
  end if;
end $$;

create index if not exists contact_messages_status_created_idx
  on public.contact_messages(status, created_at desc);

drop trigger if exists set_contact_messages_updated_at on public.contact_messages;
create trigger set_contact_messages_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
on public.contact_messages for insert
to anon, authenticated
with check (true);

grant insert on public.contact_messages to anon, authenticated;
revoke select, update, delete on public.contact_messages from anon, authenticated;

-- Fill any missing international offer without overwriting prices entered by an admin.
insert into public.variant_market_prices
  (variant_id, market_id, price, compare_at_price, is_active)
select
  variant.id,
  market.id,
  round(variant.price * case market.slug
    when 'sa' then 0.045
    when 'dubai' then 0.044
    when 'my' then 0.057
    when 'qa' then 0.044
  end, 2),
  case when variant.compare_at_price is null then null else
    round(variant.compare_at_price * case market.slug
      when 'sa' then 0.045
      when 'dubai' then 0.044
      when 'my' then 0.057
      when 'qa' then 0.044
    end, 2)
  end,
  variant.is_active
from public.product_variants variant
cross join public.markets market
where market.slug in ('sa', 'dubai', 'my', 'qa')
on conflict (variant_id, market_id) do nothing;
