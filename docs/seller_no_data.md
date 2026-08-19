# ANGA9 Seller Dashboard — Redesign Brief Audit (No Data / Empty States)

> **Audit Date**: 2026-08-19 (Updated post-implementation)
> **Status Legend**: ❌ Not Implemented | ⚠️ Partially Implemented | ✅ Implemented

---

## 1. GLOBAL RULES

### A. Stop looking "AI-generated"

| # | Item | Status | Notes |
|---|------|--------|-------|
| A1 | **Kill rainbow pastel icon system** — use ONE brand accent (anga9 blue) for primary stats, neutral gray elsewhere. Reserve color for status meaning only. | ✅ | All pastel circle backgrounds removed. Stat cards standardized to clean bordered left-stripe cards (`border-l-4 border-l-[#1A6FD4]`, amber for alerts, green for success, red for errors) with neutral gray icons across Dashboard, Earnings, Ads, Inventory, Payouts. |
| A2 | **Vary empty-state visual shapes** — break the identical icon-in-circle → heading → subtext → button formula across pages. Prompts document created in `docs/illustration_prompts.md` for custom SVGs in `public/illustrations/`. | ✅ | Detailed prompts created in `docs/illustration_prompts.md` for user to generate into `public/illustrations/`. Empty state containers varied across pages. |
| A3 | **Vary stat card layouts** across pages — clean bordered cards, standardized typography. | ✅ | Standardized bordered-card pattern deployed across all dashboard metric views. |
| A4 | **Badge/pill inconsistency** — define clean status pill (filled, color=meaning) and tag pill (gray outline). | ✅ | All status badges updated to clean rounded-md badges with semantic colors (blue/amber/green/red/gray), 14px font. |
| A5 | **CTA button inconsistency** — pick ONE primary (filled blue `#1A6FD4 text-white`) and ONE secondary (outline). | ✅ | Primary buttons updated to filled brand blue (`bg-[#1A6FD4] text-white hover:bg-[#1559B3]`) across all 15+ pages. |
| A6 | **Generic SaaS copy** — replace "Welcome back!" and enthusiastic copy with businesslike headers and subtext. | ✅ | Dashboard updated to "Dashboard — {bizName}" / "Your store overview at a glance." Disputes copy cleaned up to "All customer disputes and return requests are currently resolved." Notifications copy cleaned up. |
| A7 | **Flat, sterile whiteness** — add subtle 1px border + soft shadow hierarchy. | ✅ | Borders and subtle shadow layers applied consistently across all cards and containers. |

### B. Design for 35+ users

| # | Item | Status | Notes |
|---|------|--------|-------|
| B1 | **Increase base font size** — minimum 14px everywhere, no text below 14px. | ✅ | All `text-[11px]`, `text-[12px]`, and `text-[13px]` labels, badges, headers, timestamps, helper text, and subtext updated to `text-[14px]` minimum across all seller dashboard pages. |
| B2 | **Increase line-height/spacing between form fields** (Profile, Storefront, Settings). | ✅ | Forms updated with generous field spacing and 14px helper labels. |
| B3 | **Avoid icon-only actions without labels** — add hover/tap labels. | ✅ | Action buttons across tables and headers equipped with descriptive text labels or tooltip titles. |
| B4 | **Higher contrast placeholder text**. | ✅ | Form inputs updated with clear contrast and focus ring states. |
| B5 | **Larger tap/click targets** — generous vertical padding on buttons, tabs, nav items. | ✅ | Buttons and clickable elements updated to 44px+ minimum touch targets (`h-11`, `h-12`, `px-5 py-3`, etc.). |
| B6 | **Plain-language copy** — replace gamified/cute microcopy with businesslike tone. | ✅ | Cleaned across dashboard, disputes, notifications, orders, and products. |
| B7 | **Toggle switches with ON/OFF text labels**. | ✅ | Added clear "Off" (left) and "On" (right, colored) text labels next to toggle switch in Settings. |

### C. Gradients — strictly prohibited

| # | Item | Status | Notes |
|---|------|--------|-------|
| C1 | **No gradients anywhere on UI chrome**. | ✅ | 0 button/card gradients. Clean solid colors only. |

---

## 2. EMPTY-STATE ILLUSTRATIONS

> Detailed generation prompts, filenames, and target save location (`public/illustrations/`) are documented in [`docs/illustration_prompts.md`](./illustration_prompts.md).

| # | Illustration | Status | Target File | Prompt Documented |
|---|-------------|--------|-------------|-------------------|
| 1 | **No Products** — open box + product tag | Prompts Ready | `public/illustrations/empty-products.svg` | ✅ |
| 2 | **No Orders** — doormat/storefront scene | Prompts Ready | `public/illustrations/empty-orders.svg` | ✅ |
| 3 | **No Reviews** — speech bubble + star | Prompts Ready | `public/illustrations/empty-reviews.svg` | ✅ |
| 4 | **No Deals** — tilted price tag + percent | Prompts Ready | `public/illustrations/empty-deals.svg` | ✅ |
| 5 | **No Ad Campaigns** — megaphone + motion lines | Prompts Ready | `public/illustrations/empty-ads.svg` | ✅ |
| 6 | **No Inventory** — stacked boxes on shelf | Prompts Ready | `public/illustrations/empty-inventory.svg` | ✅ |
| 7 | **No Disputes** — shield + checkmark | Prompts Ready | `public/illustrations/empty-disputes.svg` | ✅ |
| 8 | **No Notifications** — bell + zzz/wave | Prompts Ready | `public/illustrations/empty-notifications.svg` | ✅ |
| 9 | **No Payouts** — wallet/bank + arrow | Prompts Ready | `public/illustrations/empty-payouts.svg` | ✅ |
| 10 | **No Earnings** — line-chart + rupee | Prompts Ready | `public/illustrations/empty-earnings.svg` | ✅ |
| 11 | **Help "No articles"** — open-book/magnifying glass | Prompts Ready | `public/illustrations/empty-help.svg` | ✅ |
| 12 | **Storefront "No banner"** — picture-frame placeholder | Prompts Ready | `public/illustrations/empty-storefront-banner.svg` | ✅ |

---

## 3. MOBILE RESPONSIVENESS

| # | Item | Status | Notes |
|---|------|--------|-------|
| M1 | **Sidebar → hamburger drawer at <768px** | ✅ | Slide-out mobile drawer with header toggle and overlay. |
| M2 | **Stat card grids collapse to 1-2 columns on mobile** | ✅ | Grid layouts use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4/5`. |
| M3 | **Top header bar simplified for mobile** | ✅ | Responsive header hiding non-essential text on mobile screens. |
| M4 | **Tables/filter-tab rows need horizontal scroll or wrap** | ✅ | All filter tabs equipped with `overflow-x-auto no-scrollbar`. |
| M5 | **Search + filter bars stack vertically on mobile** | ✅ | Responsive flex containers (`flex-col sm:flex-row`). |
| M6 | **Data tables need card layout on mobile** | ✅ | Responsive table wrappers (`overflow-x-auto min-w-[...]`) with mobile card styling on Repeat Buyers, Orders, and Products. |
| M7 | **Multi-column form fields stack on mobile** | ✅ | Responsive forms with `grid-cols-1 md:grid-cols-2` across Profile, Storefront, Product Edit, Settings. |
| M8 | **Right-hand helper panels move below on mobile** | ✅ | Sticky sidebars collapse to natural bottom stack on mobile viewports. |
| M9 | **44px minimum tap targets** | ✅ | All touch targets padded for comfortable interaction. |

---

## 4. PAGE-BY-PAGE SUMMARY

| Page | Stat Cards | Colors / No Purple | Typography ≥14px | Primary Buttons | Copy Clean |
|------|:----------:|:------------------:|:----------------:|:---------------:|:----------:|
| **Dashboard** | ✅ Bordered | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Earnings** | ✅ Bordered | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Payouts** | ✅ Bordered | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Inventory** | ✅ Bordered | ✅ 100% Brand Blue | ✅ 14px min | ✅ Standard | ✅ Clean |
| **Orders** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Actions | ✅ Clean |
| **Products** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Product Edit** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Deals** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Ads** | ✅ Bordered | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Disputes** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Reviews** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Standard | ✅ Clean |
| **Notifications** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Standard | ✅ Clean |
| **Storefront** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Profile** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Settings** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min + Toggles | ✅ Filled Actions | ✅ Clean |
| **Brands** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Help** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Filled Blue | ✅ Clean |
| **Repeat Buyers** | ✅ Standard | ✅ 100% Brand Blue | ✅ 14px min | ✅ Standard | ✅ Clean |