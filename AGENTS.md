# Cookest Admin Panel — Agent Instructions

You are working on the **Cookest Admin Panel**, a Next.js application for managing self-hosted Cookest instances.

## Quick Reference

| Attribute | Value |
|-----------|-------|
| Language | TypeScript 5 |
| Framework | Next.js 16 (App Router) |
| Styling | TailwindCSS 4 |
| Components | @cookest/ui (CUCL) |
| State | Zustand |
| Runtime | Bun |
| Package Manager | Bun |

## Documentation

📖 **Full documentation**: https://docs.cookest.app/docs

## Architecture

```
app/
├── layout.tsx          ← Root layout (fonts, globals)
├── page.tsx            ← Redirect to /dashboard
├── globals.css         ← TailwindCSS 4 + Cookest design tokens
├── login/page.tsx      ← Admin login
├── setup/page.tsx      ← First-run setup wizard
└── dashboard/
    ├── layout.tsx      ← Sidebar navigation + auth guard
    ├── page.tsx        ← Overview stats dashboard
    ├── users/          ← User management
    ├── recipes/        ← Recipe catalog browser
    ├── ingredients/    ← Ingredient catalog
    ├── ai/             ← AI configuration (models, rate limits)
    ├── subscriptions/  ← Tier management
    ├── promotions/     ← PDF pipeline + promotion review
    ├── database/       ← Backup, restore, migration status
    ├── system/         ← Service health monitoring
    └── settings/       ← General, registration, security settings
lib/
├── api.ts              ← Typed API client for App API + Food API
├── auth.ts             ← Zustand auth store with persistence
└── features.ts         ← Runtime feature flags from env vars
```

## Key Rules

1. **Use Cookest design tokens** — brand green `#7A9A65`, Playfair Display headings, Inter body
2. **Server-side API calls use internal URLs** — `APP_API_INTERNAL_URL` for container networking
3. **Feature flags control UI** — hide AI, Stripe, PDF sections when disabled
4. **Admin auth via App API** — `is_admin` checked from DB, never JWT alone
5. **Standalone output** — `next.config.ts` uses `output: "standalone"` for Docker

## Commit Format

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`, `chore`
Scopes: `dashboard`, `users`, `recipes`, `ai`, `settings`, `auth`, `setup`
