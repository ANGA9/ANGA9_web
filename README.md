# ANGA Dashboard

A multi-portal e-commerce dashboard for the ANGA platform, serving customers, sellers, and administrators from a single Next.js application. The project ships a unified design system, role-based routing, and analytics surfaces backed by Supabase and Firebase.

## Overview

ANGA Dashboard is the web control plane for the ANGA marketplace. It exposes three distinct experiences under one codebase:

- **Customer portal** — browsing, ordering, and account management
- **Seller portal** — catalog, orders, and revenue analytics
- **Admin portal** — platform-wide operations, moderation, and reporting

Each portal has its own primary palette and information density while sharing a common component library and layout primitives.

## Tech Stack

| Layer            | Technology                                  |
|------------------|---------------------------------------------|
| Framework        | Next.js 16 (App Router)                     |
| Language         | TypeScript 5                                |
| UI               | React 19, shadcn/ui, Base UI                |
| Styling          | Tailwind CSS 4, `tw-animate-css`            |
| Charts           | Recharts 3                                  |
| Auth & Data      | Supabase (SSR + JS client)                  |
| Realtime / Aux   | Firebase                                    |
| Icons            | lucide-react                                |
| Notifications    | react-hot-toast                             |
| Linting          | ESLint 9 (`eslint-config-next`)             |

> Note: This project pins to Next.js 16, which includes breaking changes from earlier major versions. Refer to `node_modules/next/dist/docs/` and `AGENTS.md` before adding framework-level code.

## Project Structure

```
anga-dashboard/
├── app/                    # Next.js App Router routes
│   ├── (legal)/            # Legal/static pages
│   ├── (shop)/             # Customer-facing storefront
│   ├── admin/              # Admin portal
│   ├── seller/             # Seller portal
│   ├── login/              # Auth entry
│   ├── layout.tsx
│   ├── globals.css
│   ├── robots.ts
│   └── sitemap.ts
├── components/             # Shared and portal-scoped components
│   ├── admin/
│   ├── customer/
│   ├── seller/
│   ├── legal/
│   ├── shared/
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # Reusable React hooks
├── lib/                    # Clients, utilities, server helpers
├── public/                 # Static assets
├── scripts/                # Tooling and one-off scripts
├── assets/                 # Source assets (logos, design refs)
├── DESIGN_SYSTEM.md        # Color, typography, spacing tokens
├── AGENTS.md               # Codebase conventions for contributors
└── proxy.ts                # Edge/proxy configuration
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm (or your preferred package manager)
- Supabase project credentials
- Firebase project credentials (if using realtime features)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the credentials required by the Supabase and Firebase clients in `lib/`. At minimum you will need:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
```

Check `lib/` for the exact set of variables consumed by your environment.

### Development

```bash
npm run dev
```

The dev server runs with an 8 GB Node heap (`--max-old-space-size=8192`) and serves the app at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Design System

Colors, typography, spacing, elevation, and component patterns are documented in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). It is the source of truth shared between this dashboard and the ANGA Android client — keep both in sync when introducing new tokens or components.

Each portal has a distinct primary color:

- Customer — `#1A6FD4`
- Seller — `#6C47FF`
- Admin — `#111111`

## Conventions

- Read [`AGENTS.md`](./AGENTS.md) before making framework-level changes.
- Place portal-specific components under `components/{admin|seller|customer}/`; cross-cutting primitives go in `components/ui/` or `components/shared/`.
- Server-only logic (Supabase service-role, secrets) belongs in `lib/` server modules — never imported from client components.

## Deployment

The app targets Vercel by default. Any platform with first-class Next.js 16 support will work; ensure the runtime allocates sufficient memory for the build step.

## License

Proprietary — © ANGA. All rights reserved.
