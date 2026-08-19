# Seller Dashboard — Empty State Illustration Prompts

> **Save Location**: `public/illustrations/`
> **Format**: SVG or PNG (transparent background), 240×240px

All illustrations must follow the **same visual style**:
- **Outline/line-art only** — single stroke weight (~2px), NO fills, NO 3D, NO isometric
- **Single color**: `#1A6FD4` (anga9 brand blue) on transparent background
- **Rounded line caps/joins** — friendly but professional, not cartoonish
- **Each is a small scene**, not a generic icon

---

## 1. No Products Yet
**Filename**: `empty-products.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of an open cardboard box with a product price tag hanging off the side. The box flaps are open, one item is peeking out. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional and clean, not cartoonish."

## 2. No Orders Yet
**Filename**: `empty-orders.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a small storefront window with an awning, and a delivery parcel sitting on the doorstep about to be picked up. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional and clean, implies orders are coming."

## 3. No Customer Reviews Yet
**Filename**: `empty-reviews.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a speech bubble with a small 5-pointed star inside it. The speech bubble has a gentle curved tail. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional, implies feedback will appear here."

## 4. No Deals/Promotions Yet
**Filename**: `empty-deals.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a price tag slightly tilted at an angle with a percent (%) symbol on it. A small dotted line connects it as if cut from a coupon. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional and clean."

## 5. No Ad Campaigns Yet
**Filename**: `empty-ads.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a megaphone/bullhorn with two small curved motion lines radiating from the front. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional, implies broadcasting/promotion."

## 6. No Inventory Data
**Filename**: `empty-inventory.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of three stacked boxes/crates sitting on a small shelf or rack. The boxes have different sizes. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional, implies storage/warehouse."

## 7. No Disputes (Positive Empty State)
**Filename**: `empty-disputes.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a shield with a checkmark inside it. The shield is upright and calm-looking, slightly rounded edges. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional and reassuring."

## 8. No Notifications Yet
**Filename**: `empty-notifications.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a bell with two small 'zzz' letters floating above it, implying quiet/no activity. The bell is gently tilted. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional, calm, not alarm-like."

## 9. No Payouts Requested Yet
**Filename**: `empty-payouts.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of an open wallet with a small arrow pointing into it from the right side, implying incoming payment. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional and clean."

## 10. No Earnings Yet
**Filename**: `empty-earnings.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a small upward-trending line chart with a rupee (₹) symbol next to the top of the curve. Three data points connected by lines trending upward. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional."

## 11. Help & Support "No Articles"
**Filename**: `empty-help.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of an open book with a magnifying glass hovering over one page. The book pages are slightly fanned. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional, implies searching for information."

## 12. Storefront "No Banner Image"
**Filename**: `empty-storefront-banner.svg`
**Prompt**: "Minimal single-color (#1A6FD4) outline illustration of a picture frame with a simple mountain-and-sun landscape sketch inside it, implying a placeholder image. Line-art style, single 2px stroke weight, rounded line caps, transparent background, 240x240px. Professional and clean."

---

## Usage in Code

Reference these in components like:
```tsx
<Image src="/illustrations/empty-products.svg" alt="No products" width={200} height={200} />
```
