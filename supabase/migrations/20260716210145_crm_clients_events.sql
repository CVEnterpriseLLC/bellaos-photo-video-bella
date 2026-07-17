begin;

alter table public.clients
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists preferred_language text not null default 'es',
  add column if not exists referred_by text,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.clients
  alter column brand_id set not null;

alter table public.clients
  drop constraint if exists clients_preferred_language_check,
  add constraint clients_preferred_language_check
    check (preferred_language in ('es', 'en'));

alter table public.clients
  drop constraint if exists clients_status_check,
  add constraint clients_status_check
    check (status in ('lead', 'active', 'past', 'archived'));

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  client_id uuid not null references public.clients(id) on delete restrict,
  event_type text not null,
  title text,
  event_date date not null,
  start_time time,
  venue text,
  city text,
  package_name text,
  status text not null default 'lead'
    check (status in ('lead', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_brand_created_at
  on public.clients(brand_id, created_at desc);
create index if not exists idx_clients_brand_name
  on public.clients(brand_id, last_name, first_name);
create index if not exists idx_events_brand_date
  on public.events(brand_id, event_date, start_time);
create index if not exists idx_events_client_id
  on public.events(client_id);

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

alter table public.events enable row level security;

revoke all on table public.events from anon;
grant select, insert, update, delete on table public.events to authenticated;
grant delete on table public.clients to authenticated;

drop policy if exists clients_insert_same_brand on public.clients;
create policy "clients_insert_same_brand_by_crm_roles"
on public.clients for insert
to authenticated
with check (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'sales')
  )
);

drop policy if exists clients_update_same_brand on public.clients;
create policy "clients_update_same_brand_by_crm_roles"
on public.clients for update
to authenticated
using (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'sales')
  )
)
with check (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'sales')
  )
);

create policy "clients_delete_same_brand_by_admin_roles"
on public.clients for delete
to authenticated
using (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator')
  )
);

create policy "events_read_same_brand"
on public.events for select
to authenticated
using (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
);

create policy "events_insert_same_brand_by_crm_roles"
on public.events for insert
to authenticated
with check (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.clients c
    where c.id = events.client_id and c.brand_id = events.brand_id
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'sales')
  )
);

create policy "events_update_same_brand_by_crm_roles"
on public.events for update
to authenticated
using (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'sales')
  )
)
with check (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.clients c
    where c.id = events.client_id and c.brand_id = events.brand_id
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'sales')
  )
);

create policy "events_delete_same_brand_by_admin_roles"
on public.events for delete
to authenticated
using (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator')
  )
);

commit;
