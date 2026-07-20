# Sprint 4 — Client Portal v1

## Outcome

Authenticated clients can open `/portal` and see only the records connected to their own portal membership:

- event date, venue, package, and production status;
- contracted total, payment history, and outstanding balance;
- production milestones explicitly marked as client-visible;
- a private empty state while an account is waiting to be linked.

Staff members with CRM access can use `/portal-access` to link an existing Supabase profile with the `client` role to a CRM client. Owners and administrators can remove a link.

## Data model

Migration: `supabase/migrations/20260719194500_client_portal_v1.sql`

The migration adds:

- `client_portal_memberships`, with one CRM client membership per authenticated profile;
- `production_tasks.visible_to_client`, defaulting to `false`;
- covering indexes for portal membership and visible milestones;
- deterministic defaults for the client-visible production timeline;
- helper functions that expose only the current user's brand and role to RLS policies.

## Security model

Client access is membership-based, not merely brand-based. A profile with the `client` role cannot enumerate other clients in the same brand.

The migration replaces broad read policies for:

- `clients`;
- `events`;
- `payments`;
- `production_tasks`.

Internal staff retain brand-scoped access according to their role. Client users receive read-only access to their own client record, their own events and payments, and production tasks where `visible_to_client = true`.

All write policies continue to exclude the `client` role.

## Activation workflow

1. Invite the user through Supabase Auth.
2. Assign the profile to the correct brand and the `client` role.
3. Open `/portal-access` as an owner, administrator, or sales user.
4. Select the client account, CRM client, and relationship.
5. The next login redirects the client from `/dashboard` to `/portal`.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The portal summary and membership parser have unit coverage. The production build verifies both protected routes are server-rendered.
