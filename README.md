# BellaOS — Photo Video Bella

BellaOS is the Next.js operations platform for CV Enterprise LLC. Sprint 1 establishes Supabase authentication, tenant-aware core data, and a protected executive dashboard.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable key.
3. Install dependencies with `pnpm install`.
4. Start the app with `pnpm dev`.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See [docs/SPRINT_1_BELLAOS_CORE.md](docs/SPRINT_1_BELLAOS_CORE.md) for the security model and deployment checklist.
