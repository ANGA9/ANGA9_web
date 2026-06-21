# ANGA9 Auth System — Architecture & Known Issues

> Last updated: 2026-06-21
> Audited by: Antigravity AI

---

## Architecture Overview

ANGA9 uses **Supabase Auth** for identity management with a multi-portal architecture:

| Portal | Domain | Login Page | Cookie |
|--------|--------|-----------|--------|
| Customer | `anga9.com` | `/login` or `LoginSheet` (bottom sheet) | `portal=customer` |
| Seller | `seller.anga9.com` | `/seller/login` | `portal=seller` |
| Admin | `anga9.com/admin` | `/admin/login` | `portal=admin` |
| Support | `anga9.com/support` | `/support/login` | (none set) |

### Key Files

| File | Purpose |
|------|---------|
| `lib/AuthContext.tsx` | Client-side auth state provider, cookie management, logout |
| `lib/supabase.ts` | Browser Supabase client (singleton) |
| `lib/supabaseServer.ts` | Server-side Supabase client |
| `lib/api.ts` | API client with automatic token injection |
| `proxy.ts` | Next.js middleware — route guards for admin/seller |
| `components/customer/LoginSheet.tsx` | Customer login (bottom sheet overlay) |
| `app/login/page.tsx` | Customer login (full page) |
| `app/seller/login/page.tsx` | Seller login with password + OTP modes |
| `app/admin/login/page.tsx` | Admin login (email OTP only) |
| `app/support/login/page.tsx` | Support agent login |

### Auth Flow

```
1. User enters phone/email → Supabase sends OTP (or password login for sellers)
2. User verifies OTP → Supabase creates session in localStorage
3. AuthContext picks up session → sets portal cookie, fetches public.users row
4. API calls include Bearer token → backend verifies via supabase.auth.getUser()
5. Backend looks up public.users row → attaches user to request context
```

### Important: Shared Session

All portals share the **same Supabase project** and **same localStorage** on `*.anga9.com`. This means logging into one portal creates a session visible to all other portals. The `portal` cookie and `AuthContext` portal-awareness logic handle isolation.

---

## Test Customer Account

A dummy test account exists for QA without consuming SMS credits:

| Field | Value |
|-------|-------|
| Phone | `9876543210` |
| OTP | `123456` |
| Internal password | `testpassword123` |

The bypass is implemented in:
- `LoginSheet.tsx` (customer bottom sheet)
- `app/login/page.tsx` (customer full page)
- `app/seller/login/page.tsx` (seller login)

**How it works:** The frontend skips the real `signInWithOtp()` call and instead uses `signInWithPassword()` with the hidden password. This produces a fully valid Supabase session.

---

## Changelog

### 2026-06-21 — Auth Audit & Fixes

#### Fixed: Cross-portal session bleed (P0)
**Problem:** When logged into the seller portal, visiting the customer portal would fire authenticated API calls (cart, wishlist, notifications, etc.) using the seller's token. These returned 401 because the endpoints expected customer context. Logout from the customer portal also failed because the session was "owned" by the seller context.

**Root cause:** Supabase stores sessions in `localStorage`, which is shared across all subdomains. `AuthContext` picked up the session and exposed it to customer components regardless of which portal the user logged into.

**Fix:** Added portal-awareness to `AuthContext`. When on customer pages but the `portal` cookie indicates seller/admin, the auth context suppresses the user/session state — treating the user as logged out on the customer side. The Supabase session remains in localStorage so the seller portal continues working.

#### Fixed: Middleware seller route guard (P1)
**Problem:** The Next.js middleware only checked if the `portal` cookie *existed* for seller routes, not that it equaled `"seller"`. Anyone could set `portal=anything` and see the dashboard shell.

**Fix:** Changed to `portalCookie.value !== "seller"` check, matching the admin pattern.

#### Fixed: Support portal logout cleanup (P1)
**Problem:** `SupportHeader.handleSignOut()` called `supabase.auth.signOut()` directly without clearing portal cookies, customer cookies, or localStorage — leaving stale state.

**Fix:** Added full cookie and localStorage cleanup matching `AuthContext.logout()`.

#### Fixed: `onAuthStateChange` over-fetching (P2)
**Problem:** Every Supabase event (including hourly `TOKEN_REFRESHED`) triggered a full `fetchDbUser()` database query.

**Fix:** Only fetch on `SIGNED_IN` and `USER_UPDATED` events.

#### Fixed: Dead `super_admin` role check (P2)
**Problem:** Admin login checked `role === "super_admin"`, but `super_admin` is an `admin_level`, never a `role` value.

**Fix:** Removed the dead code path.

#### Fixed: Admin bypass token exposure risk (P3)
**Problem:** `NEXT_PUBLIC_ADMIN_BYPASS_TOKEN` is bundled into client JS. If accidentally set in production Vercel env, anyone could extract it.

**Fix:** Added `NODE_ENV !== 'production'` guard on the frontend side.
