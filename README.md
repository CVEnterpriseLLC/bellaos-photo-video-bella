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

## Supabase Auth configuration

- Site URL with the default Supabase invite template:
  - `https://bellaos-photo-video-bella.vercel.app/auth/implicit?next=/update-password`
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://*-cve-nterprise-llc.vercel.app/**`
- Invite email template action URL:
  - `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/update-password`

Invited users establish a verified session, create their password, and are then
redirected to the protected dashboard.

When custom SMTP is not configured, Supabase's default invitation template uses
`{{ .ConfirmationURL }}` and redirects with an implicit session fragment. The
`/auth/implicit` client route exchanges that fragment into the same cookie-based
session used by the protected server routes. With custom SMTP, the token-hash
`/auth/confirm` route remains the preferred SSR flow.
