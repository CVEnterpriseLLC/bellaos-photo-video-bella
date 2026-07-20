begin;

create index idx_payments_event_brand
  on public.payments(event_id, brand_id);

create index idx_production_tasks_event_brand
  on public.production_tasks(event_id, brand_id);

drop policy if exists "production_tasks_update_same_brand_by_production_roles"
  on public.production_tasks;

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
  and (
    (is_completed = false and completed_at is null and completed_by is null)
    or
    (is_completed = true and completed_at is not null and completed_by = (select auth.uid()))
  )
);

commit;
