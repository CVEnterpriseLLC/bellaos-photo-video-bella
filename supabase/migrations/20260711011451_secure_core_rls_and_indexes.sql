begin;

create index if not exists idx_brands_company_id on public.brands(company_id);
create index if not exists idx_profiles_brand_id on public.profiles(brand_id);
create index if not exists idx_profiles_role_id on public.profiles(role_id);
create index if not exists idx_clients_brand_id on public.clients(brand_id);

alter table public.companies enable row level security;
alter table public.brands enable row level security;
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;

revoke all on table public.companies from anon;
revoke all on table public.brands from anon;
revoke all on table public.roles from anon;
revoke all on table public.profiles from anon;
revoke all on table public.clients from anon;

grant select on table public.companies to authenticated;
grant select on table public.brands to authenticated;
grant select on table public.roles to authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update on table public.clients to authenticated;

create policy "roles_authenticated_read"
on public.roles for select
to authenticated
using (true);

create policy "profiles_read_own"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "brands_read_assigned"
on public.brands for select
to authenticated
using (
  id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
);

create policy "companies_read_assigned"
on public.companies for select
to authenticated
using (
  exists (
    select 1
    from public.brands b
    join public.profiles p on p.brand_id = b.id
    where b.company_id = companies.id
      and p.id = (select auth.uid())
  )
);

create policy "clients_read_same_brand"
on public.clients for select
to authenticated
using (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
);

create policy "clients_insert_same_brand"
on public.clients for insert
to authenticated
with check (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
);

create policy "clients_update_same_brand"
on public.clients for update
to authenticated
using (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
)
with check (
  brand_id = (
    select p.brand_id
    from public.profiles p
    where p.id = (select auth.uid())
  )
);

commit;
