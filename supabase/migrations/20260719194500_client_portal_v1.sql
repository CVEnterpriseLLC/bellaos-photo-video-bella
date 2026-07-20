begin;

alter table public.clients
  add constraint clients_id_brand_key unique (id, brand_id);

alter table public.production_tasks
  add column if not exists visible_to_client boolean not null default false;

update public.production_tasks
set visible_to_client = true
where sort_order in (10, 40, 50, 60, 80);

create or replace function public.seed_event_production_tasks()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.production_tasks (
    brand_id,
    event_id,
    title,
    category,
    sort_order,
    visible_to_client
  )
  values
    (new.brand_id, new.id, 'Confirmar contrato y anticipo', 'planning', 10, true),
    (new.brand_id, new.id, 'Confirmar horario, ubicación y contacto', 'planning', 20, false),
    (new.brand_id, new.id, 'Asignar equipo de fotografía y video', 'planning', 30, false),
    (new.brand_id, new.id, 'Respaldar archivos originales', 'capture', 40, true),
    (new.brand_id, new.id, 'Editar fotografías', 'postproduction', 50, true),
    (new.brand_id, new.id, 'Editar video y Reel', 'postproduction', 60, true),
    (new.brand_id, new.id, 'Revisión de calidad', 'postproduction', 70, false),
    (new.brand_id, new.id, 'Entregar galería y archivos finales', 'delivery', 80, true);
  return new;
end;
$$;

revoke execute on function public.seed_event_production_tasks() from public, anon, authenticated;

create table public.client_portal_memberships (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  client_id uuid not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  relationship text not null default 'primary'
    check (relationship in ('primary', 'parent', 'partner', 'guardian', 'other')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_portal_memberships_client_brand_fkey
    foreign key (client_id, brand_id)
    references public.clients(id, brand_id)
    on delete cascade,
  constraint client_portal_memberships_user_key unique (user_id)
);

create index idx_client_portal_memberships_brand_client
  on public.client_portal_memberships(brand_id, client_id);
create index idx_production_tasks_client_visibility
  on public.production_tasks(event_id, visible_to_client)
  where visible_to_client = true;

create trigger client_portal_memberships_set_updated_at
before update on public.client_portal_memberships
for each row execute function public.set_updated_at();

alter table public.client_portal_memberships enable row level security;

revoke all on table public.client_portal_memberships from anon;
grant select, insert, update, delete on table public.client_portal_memberships to authenticated;

create or replace function public.current_user_brand_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select brand_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role_slug()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select r.slug
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
$$;

revoke execute on function public.current_user_brand_id() from public, anon;
revoke execute on function public.current_user_role_slug() from public, anon;
grant execute on function public.current_user_brand_id() to authenticated;
grant execute on function public.current_user_role_slug() to authenticated;

create policy "profiles_read_same_brand_by_crm_roles"
on public.profiles for select
to authenticated
using (
  brand_id = public.current_user_brand_id()
  and public.current_user_role_slug() in ('owner', 'administrator', 'sales')
);

create policy "client_portal_memberships_read_authorized"
on public.client_portal_memberships for select
to authenticated
using (
  user_id = (select auth.uid())
  or (
    brand_id = (
      select p.brand_id from public.profiles p where p.id = (select auth.uid())
    )
    and exists (
      select 1
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = (select auth.uid())
        and r.slug in ('owner', 'administrator', 'sales')
    )
  )
);

create policy "client_portal_memberships_insert_by_crm_roles"
on public.client_portal_memberships for insert
to authenticated
with check (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
  and created_by = (select auth.uid())
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'sales')
  )
  and exists (
    select 1
    from public.profiles target
    join public.roles target_role on target_role.id = target.role_id
    where target.id = client_portal_memberships.user_id
      and target.brand_id = client_portal_memberships.brand_id
      and target_role.slug = 'client'
  )
);

create policy "client_portal_memberships_update_by_admin_roles"
on public.client_portal_memberships for update
to authenticated
using (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator')
  )
)
with check (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles target
    join public.roles target_role on target_role.id = target.role_id
    where target.id = client_portal_memberships.user_id
      and target.brand_id = client_portal_memberships.brand_id
      and target_role.slug = 'client'
  )
);

create policy "client_portal_memberships_delete_by_admin_roles"
on public.client_portal_memberships for delete
to authenticated
using (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator')
  )
);

drop policy if exists "clients_read_same_brand" on public.clients;
create policy "clients_read_authorized"
on public.clients for select
to authenticated
using (
  (
    brand_id = (
      select p.brand_id from public.profiles p where p.id = (select auth.uid())
    )
    and exists (
      select 1
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = (select auth.uid())
        and r.slug in ('owner', 'administrator', 'sales', 'photographer', 'videographer', 'editor')
    )
  )
  or exists (
    select 1
    from public.client_portal_memberships membership
    where membership.client_id = clients.id
      and membership.user_id = (select auth.uid())
  )
);

drop policy if exists "events_read_same_brand" on public.events;
create policy "events_read_authorized"
on public.events for select
to authenticated
using (
  (
    brand_id = (
      select p.brand_id from public.profiles p where p.id = (select auth.uid())
    )
    and exists (
      select 1
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = (select auth.uid())
        and r.slug in ('owner', 'administrator', 'sales', 'photographer', 'videographer', 'editor')
    )
  )
  or exists (
    select 1
    from public.client_portal_memberships membership
    where membership.client_id = events.client_id
      and membership.user_id = (select auth.uid())
  )
);

drop policy if exists "payments_read_same_brand" on public.payments;
create policy "payments_read_authorized"
on public.payments for select
to authenticated
using (
  (
    brand_id = (
      select p.brand_id from public.profiles p where p.id = (select auth.uid())
    )
    and exists (
      select 1
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = (select auth.uid())
        and r.slug in ('owner', 'administrator', 'sales', 'photographer', 'videographer', 'editor')
    )
  )
  or exists (
    select 1
    from public.events e
    join public.client_portal_memberships membership on membership.client_id = e.client_id
    where e.id = payments.event_id
      and membership.user_id = (select auth.uid())
  )
);

drop policy if exists "production_tasks_read_same_brand" on public.production_tasks;
create policy "production_tasks_read_authorized"
on public.production_tasks for select
to authenticated
using (
  (
    brand_id = (
      select p.brand_id from public.profiles p where p.id = (select auth.uid())
    )
    and exists (
      select 1
      from public.profiles p
      join public.roles r on r.id = p.role_id
      where p.id = (select auth.uid())
        and r.slug in ('owner', 'administrator', 'sales', 'photographer', 'videographer', 'editor')
    )
  )
  or (
    visible_to_client = true
    and exists (
      select 1
      from public.events e
      join public.client_portal_memberships membership on membership.client_id = e.client_id
      where e.id = production_tasks.event_id
        and membership.user_id = (select auth.uid())
    )
  )
);

commit;
