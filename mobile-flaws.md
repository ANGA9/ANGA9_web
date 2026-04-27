# Anga9 Customer Portal — UI/UX Audit Report

> **Auditor perspective**: Senior UI/UX Designer, strict customer-first evaluation  
> **Date**: April 2026  
> **Scope**: All customer-facing pages — Mobile (<768px) and Desktop (≥768px)  
> **Rating Scale**: 1–10 (10 = production-ready premium)

---

## Table of Contents
1. [Global / Cross-Page Issues](#1-global--cross-page-issues)
2. [Home Page](#2-home-page)
3. [Product Cards](#3-product-cards)
4. [Shopping Bag (Cart)](#4-shopping-bag-cart)
5. [Checkout Page](#5-checkout-page)
6. [My Orders Page](#6-my-orders-page)
7. [Wishlist Page](#7-wishlist-page)
8. [Account Page](#8-account-page)
9. [Login Page](#9-login-page)
10. [Bottom Navigation (Mobile)](#10-bottom-navigation-mobile)
11. [Desktop Top Navigation](#11-desktop-top-navigation)
12. [Summary Scorecard](#12-summary-scorecard)

---

## 1. Global / Cross-Page Issues

### 🔴 Critical Inconsistencies

| Issue | Details | Severity |
|-------|---------|----------|
| **Double padding conflict** | `main-content-responsive` class applies `padding-inline: clamp(16px, 4vw, 24px)` globally via CSS, but Home page ALSO has `px-4` (16px) on the root div. Cart items use `main-content-responsive` class on individual sections. Some pages get double padding, some get none. | HIGH |
| **Inconsistent page wrapper patterns** | Home uses `<div className="py-4 px-4">`, Orders uses `<div className="mx-auto max-w-[1280px] py-4 px-4">`, Wishlist uses `<div className="mx-auto max-w-[1280px] px-4 py-4">`, Account uses `<div className="block md:hidden pb-24 pt-4 px-4">`. No single standardized page shell component. | HIGH |
| **No shared page title component** | Every page hand-rolls its own header. Orders, Wishlist, and Account all use `text-[20px] font-bold text-gray-900` — same styling but copy-pasted, not componentized. | MEDIUM |
| **Font weight chaos** | The app uses `font-bold`, `font-black`, `font-semibold`, `font-medium`, and `font-normal` with no clear hierarchy. Section titles alternate between `font-bold` and `font-black`. Product names are `font-bold` in one context and `font-normal` in another. | HIGH |
| **Border radius inconsistency** | Cards use `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-[14px]`, and `rounded-lg` (8px) randomly. Checkout uses `rounded-[14px]`, Account uses `rounded-2xl`, Order cards use `rounded-xl`. Pick ONE and use it everywhere. | HIGH |
| **Color token bypass** | Theme tokens exist in `customerTheme.ts`, but many components hardcode hex values directly: `text-gray-900`, `text-gray-500`, `bg-gray-50`, `#9CA3AF`. The theme file defines `textPrimary: "#1A1A2E"` but Tailwind's `text-gray-900` is `#111827` — these are DIFFERENT colors. | HIGH |
| **No loading skeleton consistency** | Home page shows `animate-pulse` gray rectangles. Cart shows a centered `Loader2` spinner. Wishlist shows a centered spinner. Orders shows a centered spinner. A premium app uses consistent skeleton patterns. | MEDIUM |

### 🟡 WCAG Violations

| Violation | Location | Standard |
|-----------|----------|----------|
| **Contrast ratio failure** | `text-[9px]` trust badge labels in Cart ("Pay via") and Checkout ("Secure", "Fast Delivery") are too small and have insufficient contrast against gray backgrounds. Minimum readable size is 12px. | WCAG 1.4.4 |
| **Missing focus indicators** | Most buttons and links have no visible `:focus-visible` ring. The global CSS only sets `outline-ring/50` which is extremely faint. Keyboard users cannot see where they are. | WCAG 2.4.7 |
| **Touch targets below 44px** | Cart quantity buttons are `w-8 h-8` (32px) — below WCAG minimum of 44x44px. The "Apply" coupon button height is 40px but has no minimum width. | WCAG 2.5.5 |
| **No skip-to-content link** | No skip navigation link exists anywhere. Screen reader users must tab through the entire header on every page load. | WCAG 2.4.1 |
| **Image alt text** | Product images use `alt={product.name}` which is correct, but hero banners' alt text is generic marketing copy, not descriptive of the visual content. | WCAG 1.1.1 |
| **No `aria-current="page"`** | Bottom nav active state is only visual (color change). No `aria-current="page"` attribute for screen readers. | WCAG 4.1.2 |

---

## 2. Home Page

### Mobile View

| Issue | Details |
|-------|---------|
| **Hero banner has no swipe gesture** | Users can only tap tiny arrow buttons (26x26px) to navigate. No touch swipe support — a basic expectation on any mobile carousel. The arrow buttons at 26px are well below WCAG's 44px minimum. |
| **Hero banner arrows overlap content** | Left arrow is at `left: 4px`, right at `right: 4px`. On a 390px screen with `px-5` (20px) padding, the arrows sit outside the safe area and may be partially hidden or hard to tap. |
| **Category grid is 4 columns on small screens** | `grid-cols-4` on a 390px screen with 16px padding = ~82px per column. Each category icon is `width: 72` but text below ("Office Essentials") will overflow or wrap awkwardly at 72px width. |
| **Category labels truncate badly** | `line-clamp-2` + `font-bold` + `text-[11px]` + `uppercase` means long names like "HOME DECOR & FLOORING" become unreadable. Consider using icons with tooltips or a horizontal scroll strip instead. |
| **Section titles feel disconnected** | "SHOP BY CATEGORY" in 18px uppercase black, followed by "VIEW ALL" in 13px blue. The visual hierarchy is unclear — both compete for attention. |
| **"Discover products for you" title is misleading** | If no user is logged in, there are no personalized recommendations. The title creates false expectations. Should say "Latest Products" or "Trending Now". |
| **Sort/Filter strip sticky position may break** | The strip uses `top: var(--mobile-header-height, 181px)` but this CSS variable is set on the MobileTopHeader div, which is a SIBLING — CSS custom properties only cascade DOWN to children, not sideways to siblings. This variable likely resolves to the fallback `181px` and may be incorrect when the search bar hides. |
| **Product grid gap is too tight** | `gap-1` (4px) between product cards on mobile is claustrophobic. Myntra, Amazon, and Flipkart all use 8-12px gaps. The cards feel crammed together. |
| **Infinite scroll has no "back to top" button** | After scrolling through 30+ products, there's no way to quickly return to the top. Basic UX for infinite scroll. |

### Desktop View

| Issue | Details |
|-------|---------|
| **Hero carousel 3D effect is disorienting** | Side banners at 50% opacity with 95% scale creates a dated "PowerPoint 2008" feel. Modern carousels (Apple, Nike) use flat transitions or subtle parallax. |
| **Category grid doesn't scale** | Same 72px fixed-width icons on desktop look tiny and lost in a 1400px container. Desktop should show larger category cards with images, not tiny icons. |
| **No "above the fold" value proposition** | A new visitor landing on desktop sees a carousel and small icons. No hero text, no USP statement, no trust indicators above the fold. Compare with Flipkart's desktop homepage. |

### Rating: **4.5 / 10**
> Functional but feels like a prototype. The home page is the first impression and it currently lacks the polish, density, and trust signals expected from a B2B wholesale marketplace.

---

## 3. Product Cards

| Issue | Details |
|-------|---------|
| **Black border is jarring** | `border-black` on product cards is too harsh. No major e-commerce platform uses full black borders on product cards. Use `border-gray-200` or subtle shadows instead. |
| **Fixed 160px image height causes distortion** | `h-[160px]` with `object-cover` means product images get cropped unpredictably. Use `aspect-ratio: 3/4` or `aspect-ratio: 1/1` instead for consistent framing. |
| **Heart icon on image competes with discount badge** | Both the heart (top-right) and discount badge (top-left) are at `top-3`. On a 160px tall image area, this leaves very little clean image space. Consider moving heart to a card action bar below the image. |
| **"ANGA9 Verified" fallback seller text** | When there's no seller name, showing "ANGA9 Verified" as the seller name is misleading — it implies a verification status, not a seller identity. Use "Seller" or show nothing. |
| **Price font is too heavy** | `font-black` (900 weight) on the price at 18px is visually overwhelming. `font-bold` (700) is sufficient. The price shouldn't scream louder than the product name. |
| **No rating stars** | A B2B marketplace with no social proof (ratings, reviews, order count) on cards feels untrustworthy. Even a simple "★ 4.2 (120 orders)" would help. |
| **Wishlist context buttons say "CART" and "BUY NOW"** | ALL CAPS button labels without icons feel aggressive. Use "Add to Cart" with a cart icon — standard convention. |

### Rating: **5 / 10**
> The cards show information but lack the sophistication and trust elements expected from a marketplace. The black border and heavy fonts make them feel like a prototype.

---

## 4. Shopping Bag (Cart)

### Mobile View

| Issue | Details |
|-------|---------|
| **Quantity buttons are 32x32px** | Below WCAG's 44x44px minimum touch target. At 32px, users with larger fingers will frequently miss-tap. These should be at minimum 44x44px. |
| **Price Details card has inconsistent internal spacing** | The card uses `space-y-4` for rows but then `py-0.5` on each row — the two conflict. The result is ~18px between rows which is too much for a summary. Use `space-y-3` with no extra padding. |
| **"Apply Coupon" has no validation feedback** | The coupon input has no error state, no success state, and the "Apply" button has no loading state. Users will tap it and see nothing happen. |
| **Savings banner in sticky footer is easy to miss** | Moving the "Yay! You're saving X" banner to the sticky bottom bar makes it compete with the "Place Order" CTA. Savings info should be above the price details, not crammed into the checkout bar. |
| **Three stacked bars at bottom (savings + pay via + CTA)** | The sticky bottom area has: savings banner + "Pay via" icons + Place Order button. That's ~130px of sticky footer. Combined with 56px bottom nav = ~186px of fixed UI. On an 844px screen, that's 22% of viewport locked. |
| **"Pay via" section uses 9px text** | `text-[9px]` for "Pay via" is illegible on any phone. Minimum body text should be 12px. |
| **Payment icons are meaningless** | Lucide icons for "UPI", "CARD", "COD" don't look like actual payment method logos. Users expect Razorpay/Visa/UPI logos, not generic icons. |
| **Coupon section styling mismatch** | The coupon card uses `bg-white rounded-2xl p-4 shadow-sm border border-gray-100` but the price details card uses `bg-gray-100 rounded-xl p-5 border border-gray-200`. Adjacent cards use completely different visual treatments. |

### Desktop View

| Issue | Details |
|-------|---------|
| **Desktop cart uses `CartSummary` component** | Desktop delegates to `CartSummary` for the sidebar, but mobile has its own inline implementation. Two separate code paths = guaranteed drift. |
| **No "Continue Shopping" link** | When items are in the cart, there's no easy way to go back and browse more products. |

### Rating: **5.5 / 10**
> Functional checkout flow but the mobile experience is cramped, has accessibility violations, and the visual hierarchy is confused by too many stacked elements at the bottom.

---

## 5. Checkout Page

| Issue | Details |
|-------|---------|
| **Not responsive for mobile** | The checkout page uses `max-w-[900px] px-4 sm:px-8 py-6` with `lg:grid-cols-5` — there is NO separate mobile layout. On mobile, the order summary stacks below the items, meaning users must scroll past all items to see the total and pay. |
| **CTA button says "Pay X with Razorpay"** | Mentioning the payment provider in the primary CTA is unusual. Users don't care HOW they pay — they care WHAT they're paying. Use "Pay X" or "Complete Order". |
| **No order total visible without scrolling** | On mobile, the price summary and pay button are below the item list. Users cannot see the total while reviewing items. A sticky bottom bar with the total would solve this. |
| **Trust badges use 9px text** | "Secure", "Fast Delivery", "Razorpay" labels are `text-[9px]` — literally unreadable. |
| **No mobile header** | The checkout page renders inside the shop layout, so on mobile it shows the full MobileTopHeader with search bar, location, and categories. This is wrong — checkout should have a minimal header (back arrow + "Checkout" title). |
| **Border radius mismatch** | Uses `rounded-[14px]` for cards but `rounded-[10px]` for buttons. Pick one. |

### Rating: **3.5 / 10**
> The checkout page is the weakest link. It has no dedicated mobile treatment, no sticky payment bar, and forces users to scroll to find the pay button. This will directly hurt conversion.

---

## 6. My Orders Page

### Mobile View

| Issue | Details |
|-------|---------|
| **Tab labels don't reflect counts** | Tabs say "All Orders", "Active", "Delivered", "Cancelled" but don't show counts. Users can't tell at a glance how many orders are in each state. Show "Active (3)" etc. |
| **Order card has no product image** | Using a generic `PackageOpen` icon instead of the actual product image makes it hard to visually identify orders. Even a 48px product thumbnail would help enormously. |
| **Action buttons overflow on small screens** | Even with `overflow-x-auto`, having 4 buttons ("Track Order", "Reorder", "Invoice", "Cancel") in a horizontal scroll is bad UX. Most users won't realize they can scroll horizontally. Limit to 2 visible buttons + a "..." menu. |
| **Cancel confirmation UI is not a modal** | The cancel confirmation appears inline, expanding the card. This is jarring and can cause the user's scroll position to shift. Use a proper bottom sheet or dialog. |
| **No estimated delivery date** | Active/Processing orders show no expected delivery date. This is the #1 thing customers want to see on their order. |
| **No order tracking link** | The "Track Order" button doesn't actually navigate anywhere — it's a dead button. |
| **Empty state is bare** | "No orders found" with no illustration or CTA feels broken. Add an illustration and a "Start Shopping" button. |

### Desktop View

| Issue | Details |
|-------|---------|
| **Subtitle text is redundant** | "Track and manage your wholesale orders" is marketing copy, not utility. On the orders page, users know why they're there. Remove or replace with a search/filter bar. |

### Rating: **5 / 10**
> Order management is functional but lacks the contextual information (images, delivery dates, tracking) that makes a customer feel informed and confident.

---

## 7. Wishlist Page

| Issue | Details |
|-------|---------|
| **No margin-top between header and grid** | The subtitle text directly borders the product grid with only the default margin. Needs at least 16-20px breathing room. |
| **Empty state uses a generic EmptyState component** | The heart icon + "Your wishlist is empty" text is fine, but the page still shows the global header with search — which is unnecessary clutter. |
| **No "Move all to Cart" button** | A common wishlist pattern is "Add all to bag". Currently users must add items one by one. |
| **Desktop grid is 4 columns** | On a 1400px container, 4 product cards with the current card design creates very wide cards with stretched images. Consider 5 columns on large screens. |
| **Product cards in wishlist show "CART" and "BUY NOW" in caps** | These labels feel impersonal and aggressive. The rest of the app doesn't use ALL CAPS for button labels. |

### Rating: **5.5 / 10**
> Workable but missing the batch-action features and the visual warmth expected from a wishlist experience.

---

## 8. Account Page

### Mobile View

| Issue | Details |
|-------|---------|
| **No profile avatar/photo** | The avatar uses initials in a blue circle. Fine as a fallback, but there's no option to upload a profile photo. |
| **Section header labels are 11px** | `text-[11px] font-black uppercase tracking-widest` for section labels. The `tracking-widest` makes them feel disconnected. Use `tracking-wider` instead. |
| **Menu items have no badge indicators** | "Notification Settings" should show an unread count badge. Without indicators, the menu is static and unengaging. |
| **"Sell on ANGA" menu item is odd in account** | A customer account page shouldn't prominently feature a B2B seller onboarding link. Creates role confusion. |
| **No "Edit Profile" action** | No way to edit name, phone, email, or GSTIN from the mobile account page. Desktop has an "Edit Profile" button but mobile doesn't. |
| **Log Out button styling** | The `mb-3` margin before the bottom nav is too tight. Content may be partially hidden behind the nav. |

### Desktop View

| Issue | Details |
|-------|---------|
| **Sidebar nav active indicator is subtle** | The `border-l-[3px]` is too thin. Use 4px border with a background tint for clearer indication. |
| **Profile card shows "Verified Seller" badge** | If a user has the `seller` role, the badge says "Verified Seller" on the CUSTOMER account page. Confusing — should only show customer-relevant info. |
| **Address book has no map/visual** | A formatted address card or map preview would make the address book feel more premium. |

### Rating: **5 / 10**
> The account page works but feels like a settings dump. Lacks personal touch and actionability.

---

## 9. Login Page

### Mobile View

| Issue | Details |
|-------|---------|
| **Phone tab is disabled with no clear explanation** | Displaying a disabled tab is bad UX. Either hide the phone tab entirely or gray it out with a tooltip. |
| **OTP input boxes are 44px wide x 48px tall** | Fine for touch targets but `text-xl font-bold` makes digits look crowded. Use `text-2xl` with slightly wider boxes (48px). |
| **No resend OTP option** | After requesting an OTP, there's no "Resend OTP" button or timer. Users who don't receive the email have no recourse except refreshing. CRITICAL missing feature. |
| **Login page uses `<a>` tags instead of `<Link>`** | The back arrow and logo use `<a href="/">` causing full page reloads instead of client-side navigation. |

### Desktop View

| Issue | Details |
|-------|---------|
| **Left panel hero image is 500px fixed width** | On smaller desktops (1024px), the login form gets squeezed. Use `flex-1` with `min-width` instead. |
| **Trust signals are absent** | No mentions of "100% Secure", no padlock icons, no social proof. Premium login pages always reinforce security. |

### Rating: **6 / 10**
> Clean design with good visual hierarchy, but missing critical features (resend OTP, proper navigation).

---

## 10. Bottom Navigation (Mobile)

| Issue | Details |
|-------|---------|
| **Labels trimmed with `.replace('My ', '')`** | Fragile string manipulation. If a future tab is named "Symbols", it'll break. Use explicit short labels. |
| **No haptic feedback** | `active:scale-95` provides visual feedback but no haptic. Subtle vibration improves perceived quality. |
| **Icons use stroke-based differentiation** | Active: `strokeWidth: 2.5`, Inactive: `strokeWidth: 2`. The 0.5px difference is nearly invisible. Use filled vs outlined icons (like iOS tab bars). |
| **No badge on "Orders" tab** | If a user has active orders, there should be a badge indicator — similar to how Cart and Wishlist show counts in the header. |

### Rating: **6 / 10**

---

## 11. Desktop Top Navigation

| Issue | Details |
|-------|---------|
| **Two full-width rows is excessive** | Row 1: Logo + Pincode + Sell + Login. Row 2: Search + Wishlist + Cart + More. At 72px each = 144px of sticky header. Most competitors use a single 64-72px row. |
| **Search bar has no category dropdown** | Amazon, Flipkart, and IndiaMART all have a category selector inside the search bar. Standard for marketplace UX. |
| **"More" dropdown items are generic** | "Advertise on ANGA9" and "Download the App" are seller/marketing links in customer navigation. Creates friction and confusion. |
| **Login tooltip animation is distracting** | The "Login for better offers" callout with infinite `calloutJiggle` animation is annoying. Infinitely looping animations violate WCAG 2.2.2 (Pause, Stop, Hide). |
| **Wishlist hover color is purple (#4338CA)** | Wishlist changes to indigo on hover, but cart changes to blue (#1A6FD4). Inconsistent hover colors within the same nav bar. |

### Rating: **5.5 / 10**

---

## 12. Summary Scorecard

| Page | Mobile | Desktop | Combined |
|------|--------|---------|----------|
| **Home** | 4.5 | 4.5 | **4.5** |
| **Product Cards** | 5.0 | 5.0 | **5.0** |
| **Cart** | 5.5 | 5.0 | **5.5** |
| **Checkout** | 3.0 | 4.0 | **3.5** |
| **Orders** | 5.0 | 5.0 | **5.0** |
| **Wishlist** | 5.5 | 5.0 | **5.5** |
| **Account** | 5.0 | 5.0 | **5.0** |
| **Login** | 6.0 | 6.0 | **6.0** |
| **Bottom Nav** | 6.0 | — | **6.0** |
| **Desktop Nav** | — | 5.5 | **5.5** |

### **Overall Score: 5.1 / 10**

---

## Priority Fix Recommendations (Top 10)

1. **Create a `<PageShell>` component** — Standardize the wrapper for every page with consistent padding, max-width, and title rendering.
2. **Fix checkout mobile experience** — Add a sticky bottom bar with total + pay button. Hide the full header and show a minimal one.
3. **Standardize border-radius** — Pick `12px` (`rounded-xl`) for all cards across the entire app. Remove all `rounded-[14px]`, `rounded-2xl` variations.
4. **Fix WCAG touch targets** — Every tappable element must be minimum 44x44px. Cart qty buttons, hero arrows, and coupon buttons all fail.
5. **Remove black borders from product cards** — Replace with `border-gray-200` or drop shadow only. Black borders make cards look like wireframes.
6. **Add swipe support to hero carousel** — Use touch event handlers or a library like `embla-carousel`. Arrow-only navigation is not acceptable on mobile.
7. **Use theme tokens exclusively** — Audit every `text-gray-*` and hardcoded hex color. Replace with `customerTheme.ts` tokens or CSS variables.
8. **Remove 9px text everywhere** — Search for `text-[9px]`, `text-[10px]` and increase to minimum 12px. Sub-12px text is unreadable and violates accessibility guidelines.
9. **Add product images to order cards** — Fetch and display the first product image from each order for visual identification.
10. **Add a resend OTP feature to the login page** — Show a 60-second countdown timer, then enable a "Resend OTP" button.

---

> **Final note from a customer's perspective**: The app feels like a well-structured prototype, not a finished product. The information architecture is sound, but the visual execution lacks the confidence and consistency of a marketplace that wants me to trust it with wholesale-sized transactions. Every page has 2-3 things that feel "almost right but not quite" — and that cumulative feeling of "almost" erodes trust. The checkout page is the most critical area to fix immediately, as it directly impacts revenue.
