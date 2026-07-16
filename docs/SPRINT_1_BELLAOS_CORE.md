# BellaOS Sprint 1 — Core

## Outcome

Establish the secure application foundation for CV Enterprise LLC without exposing privileged credentials or allowing public self-registration.

## Scope

- Supabase SSR integration for Next.js App Router.
- Email/password login for invited users.
- Cookie refresh middleware and protected route group.
- Core schema for companies, brands, roles, and profiles.
- Automatic profile creation from `auth.users`.
- Seed records for CV Enterprise LLC, Photo Video Bella, and operational roles.
- Protected executive dashboard scaffold backed by RLS-filtered data.

## Security decisions

- The browser uses only a publishable Supabase key.
- No service-role key is used by the application.
- Public sign-up is not exposed; administrators invite users.
- New profiles have no brand or role by default.
- Users can update only their own `full_name`; brand and role assignment remain privileged operations.
- Existing tenant-scoped RLS policies remain the authorization boundary.

## Deployment checklist

1. Set `NEXT_PUBLIC_SUPABASE_URL` in local and Vercel environments.
2. Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in local and Vercel environments.
3. Add the production URL and local URL to Supabase Auth redirect URLs.
4. Invite the first owner in Supabase Auth.
5. Assign that profile to Photo Video Bella and the Owner role through a trusted database/admin workflow.
6. Verify `/login`, `/dashboard`, sign-out, and an expired-session redirect.

## Acceptance criteria

- Unauthenticated requests to `/dashboard` redirect to `/login`.
- Authenticated users can load `/dashboard`.
- Unassigned users see no company data and receive a clear pending-access state.
- Assigned users see only their company, brand, role, and RLS-visible client count.
- Lint, typecheck, tests, and production build pass.
