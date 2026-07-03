# BellaOS Master Plan v1.0

## Executive Vision

BellaOS is the operating platform for CV Enterprise LLC. It will start as the operational system for Photo Video Bella and expand into a modular enterprise platform that can support multiple brands from one shared technical foundation.

Initial brands:

- Photo Video Bella
- Weddings Bella
- Stream Event
- Brupronet
- Event Houston

The goal is not to build a generic CRM. The goal is to build a vertical operating system for photography, video, event production, client delivery, marketing, and business intelligence.

---

## Current Technical Baseline

Repository: `CVEnterpriseLLC/bellaos-photo-video-bella`

Current active foundation branch:

- `copilot/convert-bellaos-to-nextjs`

Confirmed checks:

- `npm install`: pass
- `npm run lint`: pass
- `npm run build`: pass
- `npx tsc --noEmit`: pass
- Vercel project framework preset: Next.js
- Vercel deployment status after configuration fix: ready

Current PR:

- PR #1: Rebuild BellaOS MVP as a modular Next.js 15 + TypeScript app

---

## Product Principles

1. Stability before features.
2. Security by default.
3. Multi-tenant architecture from the beginning.
4. Every module must solve a real business workflow.
5. The system must remain deployable at all times.
6. Marketing, CRM, production, client delivery, and reporting should eventually operate from one platform.

---

## Architecture Direction

### Short-term structure

For the current foundation, BellaOS remains a standard Next.js app at the repository root:

```text
app/
components/
lib/
types/
public/
docs/
```

This is the correct structure for the current stage because it keeps Vercel deployment simple and avoids premature monorepo complexity.

### Long-term modular direction

As the platform grows, BellaOS should evolve into clear bounded modules:

```text
Core
CRM
Events
Contracts
Payments
Media
Client Portal
Marketing Suite
AI Studio
Business Intelligence
```

The Metricool marketing platform should continue as a separate project until stable. After that, it should be audited and integrated as the BellaOS Marketing Suite.

---

## BellaOS Core

BellaOS Core is the foundation for every future module.

Core responsibilities:

- Organizations / brands
- Users
- Roles
- Permissions
- Authentication
- Audit logs
- Settings
- Notifications

### Initial role model

Recommended initial roles:

- owner
- admin
- manager
- sales
- editor
- shooter
- client

### Initial tenant model

Recommended top-level entity:

```text
organization
  └── brand
        └── users, clients, events, contracts, payments, media
```

This allows CV Enterprise LLC to operate multiple brands while keeping data isolated and reportable.

---

## Data Model Blueprint

Initial entities:

```text
organizations
brands
profiles
roles
clients
events
contracts
payments
media_items
portal_access
audit_logs
notifications
```

Recommended key rule:

Every operational table should include:

- `id`
- `organization_id`
- `brand_id` where applicable
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `deleted_at` for soft delete where applicable

---

## Sprint Roadmap

### Sprint 0 — Foundation

Status: in progress / near completion

Goals:

- Validate PR #1
- Fix Vercel deployment configuration
- Merge stable foundation into `main`
- Keep `main` production-ready

Acceptance criteria:

- Lint passes
- Build passes
- Typecheck passes
- Vercel deployment is ready
- PR reviewed before merge

### Sprint 1 — BellaOS Core

Goals:

- Supabase setup
- Authentication
- Organizations and brands
- Profiles and roles
- Initial RLS policies

Acceptance criteria:

- Users can log in
- Each user belongs to an organization
- RLS prevents cross-organization data access
- Admin can view core dashboard

### Sprint 2 — CRM Core

Goals:

- Clients
- Events
- Basic event status tracking
- Lead source tracking

Acceptance criteria:

- Admin can create and edit clients
- Admin can create and edit events
- Events are linked to clients and brands

### Sprint 3 — Contracts and Payments

Goals:

- Contracts
- Quotes
- Payments
- Basic financial status

Acceptance criteria:

- Contract can be linked to an event
- Payment can be linked to a contract
- Outstanding balance can be calculated

### Sprint 4 — Media and Client Portal

Goals:

- Gallery/media records
- Client portal access
- Delivery status

Acceptance criteria:

- Client can access assigned media
- Media is scoped by client/event/brand
- Signed URLs or protected access are used

### Sprint 5 — AI and Automation

Goals:

- AI content assistant
- Workflow reminders
- Payment reminders
- Event follow-ups

Acceptance criteria:

- Basic AI Studio module exists
- Reminder workflows are documented and testable

### Sprint 6 — Marketing Suite Integration

Goals:

- Audit external Metricool platform
- Define integration boundaries
- Import or connect marketing analytics

Acceptance criteria:

- Marketing module has clear data contract
- Metricool integration does not compromise BellaOS Core stability

---

## Engineering Standards

No pull request should merge into `main` unless:

- `npm run lint` passes
- `npm run build` passes
- `npx tsc --noEmit` passes
- Vercel preview deployment is ready
- Technical review is complete

Branch strategy:

```text
main        production/stable
develop     integration
feature/*   new work
release/*   release stabilization
hotfix/*    urgent production fixes
```

---

## Immediate Next Actions

1. Confirm latest Vercel deployment for PR #1 is ready.
2. Complete final PR review.
3. Merge PR #1 into `main` if no blocker remains.
4. Create `develop` from updated `main`.
5. Start Sprint 1 with Supabase and BellaOS Core.

---

## Technical Decision

Current recommendation: GO WITH CONTROLLED MERGE.

The foundation is valid after build and Vercel validation, but the merge should happen only after final PR review and confirmation that the latest deployment for the current head commit is ready.
