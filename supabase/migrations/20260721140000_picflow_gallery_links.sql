alter table public.events
  add column if not exists picflow_gallery_url text,
  add column if not exists gallery_status text not null default 'preparing',
  add column if not exists gallery_updated_at timestamptz;

alter table public.events
  drop constraint if exists events_gallery_status_check,
  add constraint events_gallery_status_check
    check (gallery_status in ('preparing', 'proofing', 'delivered')),
  drop constraint if exists events_picflow_gallery_url_check,
  add constraint events_picflow_gallery_url_check
    check (picflow_gallery_url is null or picflow_gallery_url ~ '^https://');

comment on column public.events.picflow_gallery_url is
  'Secure customer-facing Picflow gallery URL. Access remains governed by events RLS.';
comment on column public.events.gallery_status is
  'Gallery lifecycle: preparing, proofing, or delivered.';
