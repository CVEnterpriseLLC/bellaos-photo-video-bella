# Sprint 2 — CRM: Clients and Events

## Delivered scope

- Protected client directory at `/clients`.
- Protected event agenda at `/events`.
- Server Actions for client and event creation.
- Client-to-event relational model in Supabase.
- Brand isolation with Row Level Security.
- Write access limited to `owner`, `administrator`, and `sales`.
- Delete policies limited to `owner` and `administrator` (UI deferred).
- Responsive Spanish-first forms for Photo Video Bella.

## Data model

`clients` stores contact and relationship data. Legacy `event_type` and
`event_date` columns remain temporarily for backwards compatibility, but new
event records must use the `events` table.

`events` belongs to both a brand and a client. Its RLS policy verifies that the
selected client belongs to the same brand before allowing inserts or updates.

## Verification

- ESLint
- TypeScript (`tsc --noEmit`)
- Vitest (17 tests)
- Next.js production build
- Supabase security and performance advisors
- Transactional RLS insert test for an Owner creating a client and event

The only security-advisor warning is leaked-password protection, which is a
Supabase Pro feature. BellaOS remains on the Free plan with a minimum password
length of eight characters.
