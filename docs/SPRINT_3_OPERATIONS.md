# Sprint 3 — Payments and Production

## Outcome

Sprint 3 turns an event into an operational project. Authorized team members can edit client and event records, register payments, review the outstanding balance, and work through a production checklist.

## Data model

### `events`

- `total_amount`: contracted value in USD.
- `production_status`: planning, scheduled, captured, editing, review, or delivered.

### `payments`

- Belongs to one event and one brand.
- Stores amount, payment date, method, reference, notes, and creator.
- Composite foreign key prevents an event from another brand being attached.

### `production_tasks`

- Belongs to one event and one brand.
- Stores category, order, due date, completion state, and completion author.
- New events automatically receive the standard eight-step Photo Video Bella checklist.

## Permissions

- All authenticated team roles can read records for their assigned brand.
- Owner, Administrator, and Sales can register payments.
- Owner and Administrator can update or delete existing payments.
- Owner, Administrator, Photographer, Videographer, and Editor can create and complete production tasks.
- Only Owner and Administrator can delete production tasks.
- RLS and composite foreign keys enforce brand isolation independently of the UI.

## Application routes

- `/clients/[id]`: edit contact information and CRM status.
- `/events/[id]`: edit event details, see financial summary, register payments, and manage production.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Supabase security and performance advisors are checked after the migrations. The only accepted security warning on the Free plan is leaked-password protection, which requires Supabase Pro.
