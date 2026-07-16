begin;

alter table public.companies
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists is_active boolean not null default true;

alter table public.brands
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists is_active boolean not null default true;

alter table public.roles
  add column if not exists slug text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

update public.companies
set slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

update public.brands
set slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

update public.roles
set slug = lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

alter table public.companies alter column slug set not null;
alter table public.brands alter column slug set not null;
alter table public.roles alter column slug set not null;

create unique index if not exists brands_company_slug_key
  on public.brands(company_id, slug);
create unique index if not exists roles_slug_key on public.roles(slug);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists brands_set_updated_at on public.brands;
create trigger brands_set_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists roles_set_updated_at on public.roles;
create trigger roles_set_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

insert into public.roles (name, slug, description)
values
  ('Owner', 'owner', 'Full company ownership and administration.'),
  ('Administrator', 'administrator', 'Administrative access to company operations.'),
  ('Sales', 'sales', 'Client, quote, contract, and payment workflows.'),
  ('Photographer', 'photographer', 'Assigned photography production work.'),
  ('Videographer', 'videographer', 'Assigned video production work.'),
  ('Editor', 'editor', 'Post-production and delivery work.'),
  ('Client', 'client', 'Restricted client portal access.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

insert into public.companies (name, slug)
values ('CV Enterprise LLC', 'cv-enterprise-llc')
on conflict (slug) do update
set name = excluded.name,
    updated_at = now();

insert into public.brands (company_id, name, slug)
select id, 'Photo Video Bella', 'photo-video-bella'
from public.companies
where slug = 'cv-enterprise-llc'
on conflict (company_id, slug) do update
set name = excluded.name,
    updated_at = now();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    new.email
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      updated_at = now();

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists auth_user_created_create_profile on auth.users;
create trigger auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user();

drop trigger if exists auth_user_updated_sync_profile on auth.users;
create trigger auth_user_updated_sync_profile
after update of email, raw_user_meta_data on auth.users
for each row execute function public.handle_new_user();

grant update(full_name) on table public.profiles to authenticated;

drop policy if exists profiles_update_own_name on public.profiles;
create policy "profiles_update_own_name"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

commit;

