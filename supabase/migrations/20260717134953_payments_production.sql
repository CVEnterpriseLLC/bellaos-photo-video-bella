begin;

alter table public.events
  add column if not exists total_amount numeric(12,2) not null default 0,
  add column if not exists production_status text not null default 'planning';

alter table public.events
  drop constraint if exists events_total_amount_check,
  add constraint events_total_amount_check check (total_amount >= 0),
  drop constraint if exists events_production_status_check,
  add constraint events_production_status_check
    check (production_status in ('planning', 'scheduled', 'captured', 'editing', 'review', 'delivered'));

alter table public.events
  add constraint events_id_brand_key unique (id, brand_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  event_id uuid not null,
  amount numeric(12,2) not null check (amount > 0),
  payment_date date not null default current_date,
  method text not null default 'other'
    check (method in ('cash', 'card', 'check', 'bank_transfer', 'zelle', 'paypal', 'other')),
  reference text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_event_brand_fkey
    foreign key (event_id, brand_id)
    references public.events(id, brand_id)
    on delete cascade
);

create table public.production_tasks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete restrict,
  event_id uuid not null,
  title text not null check (char_length(trim(title)) between 2 and 160),
  category text not null default 'planning'
    check (category in ('planning', 'capture', 'postproduction', 'delivery')),
  sort_order integer not null default 0 check (sort_order >= 0),
  due_date date,
  is_completed boolean not null default false,
  completed_at timestamptz,
  completed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint production_tasks_event_brand_fkey
    foreign key (event_id, brand_id)
    references public.events(id, brand_id)
    on delete cascade
);

create index idx_payments_brand_event_date
  on public.payments(brand_id, event_id, payment_date desc);
create index idx_payments_created_by
  on public.payments(created_by)
  where created_by is not null;
create index idx_production_tasks_brand_event_order
  on public.production_tasks(brand_id, event_id, sort_order, created_at);
create index idx_production_tasks_completed_by
  on public.production_tasks(completed_by)
  where completed_by is not null;

create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger production_tasks_set_updated_at
before update on public.production_tasks
for each row execute function public.set_updated_at();

create or replace function public.seed_event_production_tasks()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.production_tasks (brand_id, event_id, title, category, sort_order)
  values
    (new.brand_id, new.id, 'Confirmar contrato y anticipo', 'planning', 10),
    (new.brand_id, new.id, 'Confirmar horario, ubicación y contacto', 'planning', 20),
    (new.brand_id, new.id, 'Asignar equipo de fotografía y video', 'planning', 30),
    (new.brand_id, new.id, 'Respaldar archivos originales', 'capture', 40),
    (new.brand_id, new.id, 'Editar fotografías', 'postproduction', 50),
    (new.brand_id, new.id, 'Editar video y Reel', 'postproduction', 60),
    (new.brand_id, new.id, 'Revisión de calidad', 'postproduction', 70),
    (new.brand_id, new.id, 'Entregar galería y archivos finales', 'delivery', 80);
  return new;
end;
$$;

revoke execute on function public.seed_event_production_tasks() from public, anon, authenticated;

create trigger events_seed_production_tasks
after insert on public.events
for each row execute function public.seed_event_production_tasks();

insert into public.production_tasks (brand_id, event_id, title, category, sort_order)
select defaults.brand_id, defaults.event_id, defaults.title, defaults.category, defaults.sort_order
from (
  select e.brand_id, e.id as event_id, task.title, task.category, task.sort_order
  from public.events e
  cross join (
    values
      ('Confirmar contrato y anticipo', 'planning', 10),
      ('Confirmar horario, ubicación y contacto', 'planning', 20),
      ('Asignar equipo de fotografía y video', 'planning', 30),
      ('Respaldar archivos originales', 'capture', 40),
      ('Editar fotografías', 'postproduction', 50),
      ('Editar video y Reel', 'postproduction', 60),
      ('Revisión de calidad', 'postproduction', 70),
      ('Entregar galería y archivos finales', 'delivery', 80)
  ) as task(title, category, sort_order)
) defaults
where not exists (
  select 1 from public.production_tasks pt where pt.event_id = defaults.event_id
);

alter table public.payments enable row level security;
alter table public.production_tasks enable row level security;

revoke all on table public.payments, public.production_tasks from anon;
grant select, insert, update, delete on table public.payments to authenticated;
grant select, insert, update, delete on table public.production_tasks to authenticated;

create policy "payments_read_same_brand"
on public.payments for select
to authenticated
using (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
);

create policy "payments_insert_same_brand_by_finance_roles"
on public.payments for insert
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
);

create policy "payments_update_same_brand_by_admin_roles"
on public.payments for update
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
);

create policy "payments_delete_same_brand_by_admin_roles"
on public.payments for delete
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

create policy "production_tasks_read_same_brand"
on public.production_tasks for select
to authenticated
using (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
);

create policy "production_tasks_insert_same_brand_by_production_roles"
on public.production_tasks for insert
to authenticated
with check (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
  and exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = (select auth.uid())
      and r.slug in ('owner', 'administrator', 'photographer', 'videographer', 'editor')
  )
);

create policy "production_tasks_update_same_brand_by_production_roles"
on public.production_tasks for update
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
      and r.slug in ('owner', 'administrator', 'photographer', 'videographer', 'editor')
  )
)
with check (
  brand_id = (
    select p.brand_id from public.profiles p where p.id = (select auth.uid())
  )
);

create policy "production_tasks_delete_same_brand_by_admin_roles"
on public.production_tasks for delete
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

commit;
