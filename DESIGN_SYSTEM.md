# ANGA Design System - Android Developer Reference

> Style guide extracted from the ANGA web dashboard. Use this as the single source of truth for colors, typography, spacing, elevation, and component styling when building the Android app.

---

## 1. Color Palette

### 1.1 Portal Primary Colors

| Portal   | Primary     | Hover       | Accent    | Accent Text |
|----------|-------------|-------------|-----------|-------------|
| Customer | `#1A6FD4`   | `#115FA0`   | `#FFCC00` | `#1A1A2E`  |
| Seller   | `#6C47FF`   | `#5835DB`   | -         | -           |
| Admin    | `#111111`   | `#333333`   | -         | -           |

### 1.2 Semantic / Status Colors

| Name    | Hex       | Usage                                 |
|---------|-----------|---------------------------------------|
| Green   | `#22C55E` | Success, delivered, active, in-stock  |
| Amber   | `#F59E0B` | Warning, processing, pending, low-stock|
| Red     | `#EF4444` | Error, cancelled, out-of-stock        |
| Purple  | `#6C47FF` | Shipped status, seller badge          |

Status badge pattern: **10% opacity background** + **full color text**
Example: `bg: #22C55E @ 10% opacity`, `text: #22C55E`

### 1.3 Neutral / Grayscale

| Token             | Hex       | Usage                         |
|-------------------|-----------|-------------------------------|
| Black             | `#111111` | Primary text, headings        |
| Near-black        | `#1A1A2E` | Customer portal primary text  |
| Dark gray         | `#374151` | Badges, secondary icons       |
| Medium gray       | `#4B5563` | Customer secondary text       |
| Gray              | `#6B7280` | Muted text, labels, captions  |
| Light gray        | `#9CA3AF` | Placeholder text, disabled    |
| Border gray       | `#D1D5DB` | Dividers, chart gridlines     |
| Border            | `#E5E7EB` | Card/section borders (admin, seller) |
| Customer border   | `#E8EEF4` | Card/section borders (customer) |
| Light surface     | `#F3F4F6` | Hover backgrounds, chips      |
| Background        | `#F7F7F8` | Page background (admin, seller) |
| White             | `#FFFFFF` | Cards, page bg (customer)     |

### 1.4 Customer Portal Extended

| Token         | Hex       | Usage                          |
|---------------|-----------|--------------------------------|
| Blue primary  | `#1A6FD4` | Links, active states, search border, icons |
| Blue tint bg  | `#EAF2FF` | Category icon backgrounds, tag bg |
| Search border | `#D0E3F7` | Input field border (unfocused) |
| Yellow CTA    | `#FFCC00` | Primary action buttons, cart badge |
| CTA text      | `#1A1A2E` | Text on yellow buttons         |
| Wishlist red  | `#DC2626` | Wishlist heart hover           |
| Delivered bg  | `#DCFCE7` | Order delivered background     |
| Processing bg | `#FEF3C7` | Order processing background    |
| Cancelled bg  | `#FEE2E2` | Order cancelled background     |

---

## 2. Typography

### 2.1 Font Family

```
Primary: Roboto
Fallback: system-ui, -apple-system, BlinkMacSystemFont, sans-serif
Weights available: 100, 300, 400, 500, 700, 900
```

Android equivalent: Use `Roboto` (default system font) or import via Google Fonts.

### 2.2 Font Size Scale

| Size  | Usage                                              | Weight     |
|-------|----------------------------------------------------|------------|
| 26px  | Brand logo ("ANGA")                                | 800 (ExtraBold) |
| 20px  | Section headings, product price                    | 700 (Bold) |
| 17px  | Callout/tooltip text                               | 400 (Regular) |
| 15px  | Navigation text, form inputs, body text, buttons   | 500 (Medium) |
| 14px  | General body text (Tailwind `text-sm`)             | 400 (Regular) |
| 13px  | Category strip tabs, mega-dropdown items, captions | 500 (Medium) |
| 12px  | Chart labels, strikethrough prices, table headers  | 400-500    |
| 11px  | Seller name, product metadata, small labels        | 400 (Regular) |
| 10px  | Portal badges, notification badges                 | 600-700    |
| 9px   | Cart count overlay badge                           | 700 (Bold) |

### 2.3 Line Heights

| Context        | Line Height |
|----------------|-------------|
| Body text      | 1.5         |
| Input fields   | 1.4         |
| Headings       | 1.2 - 1.3  |
| Badges/labels  | 1.0         |

### 2.4 Letter Spacing

| Context             | Value      |
|---------------------|------------|
| Logo                | `tight` (-0.025em) |
| Mega menu headings  | `0.04em`   |
| Callout text        | `wide` (0.025em) |
| Default             | `normal`   |

---

## 3. Spacing System

Base unit: **4px**

| Token | Value  | Common usage                        |
|-------|--------|-------------------------------------|
| xs    | 4px    | Icon gaps, tight padding            |
| sm    | 8px    | Badge padding, small gaps           |
| md    | 12px   | Card internal padding, input padding|
| lg    | 16px   | Section padding, form field padding |
| xl    | 20px   | Section margins, medium gaps        |
| 2xl   | 24px   | Container horizontal padding, nav gaps |
| 3xl   | 28px   | Callout padding                     |
| 4xl   | 36px   | Navigation item gaps (row 2)        |
| 5xl   | 40px   | Search-to-icons margin              |
| 6xl   | 48px   | Section top margins                 |

### Content Constraints

| Element             | Max Width |
|---------------------|-----------|
| Main content        | 1280px    |
| Search bar          | 700px     |
| Login form          | 448px (`max-w-md`) |
| Horizontal padding  | 24px each side |

---

## 4. Border Radius

| Token     | Value | Usage                                   |
|-----------|-------|-----------------------------------------|
| none      | 0px   | -                                       |
| xs        | 4px   | Search input                            |
| sm        | 6px   | Small badges, discount tags             |
| md        | 8px   | Dropdowns, buttons, tooltips            |
| base      | 10px  | CTA buttons, default rounded            |
| lg        | 12px  | Cards (admin/seller)                    |
| xl        | 14px  | Product cards, order cards, cart summary|
| 2xl       | 16px  | Category cards, login card, banners     |
| full      | 9999px| Badges, dots, avatar circles            |

---

## 5. Elevation / Shadows

| Level   | Value                              | Usage                    |
|---------|------------------------------------|--------------------------|
| None    | -                                  | Flat cards (border only) |
| sm      | `0 1px 2px rgba(0,0,0,0.05)`      | Buttons, nav items       |
| md      | `0 4px 6px rgba(0,0,0,0.07)`      | Banner images            |
| lg      | `0 8px 24px rgba(0,0,0,0.1)`      | Dropdown menus           |
| mega    | `0 8px 24px rgba(0,0,0,0.07)`     | Mega dropdown            |

Android equivalent: Use `elevation` dp values.
- sm = 1-2dp
- md = 4dp
- lg = 8dp

---

## 6. Z-Index Layering

| Layer               | Z-Index | Description                    |
|---------------------|---------|--------------------------------|
| Base content        | 0       | Default page content           |
| Banner nav arrows   | 20      | Hero carousel controls         |
| Dark overlay        | 20      | Mega dropdown scrim            |
| Category strip      | 30      | Sticky category navigation     |
| Sidebar overlay     | 40      | Mobile sidebar scrim           |
| Top navigation      | 40      | Sticky header                  |
| Dropdowns/tooltips  | 50      | Menus, popovers, callouts      |
| Sidebar (mobile)    | 50      | Mobile drawer                  |

---

## 7. Component Heights

| Component            | Height |
|----------------------|--------|
| Top nav row 1        | 56px   |
| Top nav row 2        | 72px   |
| Category strip       | 44px   |
| Search input         | ~46px (12px padding top/bottom + border) |
| CTA buttons          | 44px   |
| Form inputs          | 44px (`h-11`) |
| Login callout box    | 52px   |
| Dropdown menu items  | ~42px (15px text + 10px padding each side) |

---

## 8. Icon Sizes

| Context                | Size   |
|------------------------|--------|
| Navigation icons       | 18-20px|
| Dropdown menu icons    | 18px   |
| Category strip icons   | 22px   |
| Small inline icons     | 16px   |
| Hero/empty state icons | 48px   |
| Product card icons     | 24px   |

---

## 9. Animations

### Callout Jiggle
```
Duration: 2s, infinite loop
Easing: ease-in-out
Keyframes:
  0-70%   → translateX(0)
  74%     → translateX(-2px)
  78%     → translateX(+2px)
  82%     → translateX(-2px)
  86%     → translateX(+2px)
  90%     → translateX(-1px)
  94%     → translateX(+1px)
  100%    → translateX(0)
Auto-dismiss: after 10 seconds
```

### Mega Dropdown Fade-In
```
Duration: 150ms
Easing: ease
Direction: forwards
Keyframes:
  from → opacity: 0, translateY(6px)
  to   → opacity: 1, translateY(0)
```

### Hero Banner Slide
```
Duration: 700ms
Easing: cubic-bezier(0.25, 1, 0.5, 1)
Properties: all (scale, translate, opacity, z-index)
```

### General Transitions
```
Hover color change:  ~150ms ease
Opacity change:      ~150ms ease
Scale on hover:      1.03x, 150ms
Button press:        translateY(1px)
```

---

## 10. Common Patterns

### Cards
- White background (`#FFFFFF`)
- 1px border (`#E8EEF4` customer, `#E5E7EB` admin/seller)
- Border radius: 14px (customer), 12px (admin/seller)
- On hover: border becomes primary color or shadow elevates

### Badges
- Rounded pill shape (`border-radius: full`)
- 10% opacity background of status color
- Full status color text
- Font size: 10-13px, weight: 600

### CTA Buttons (Customer)
- Background: `#FFCC00`
- Text: `#1A1A2E`
- Font: 15px, bold
- Height: 44px
- Border radius: 10px
- Hover: opacity 0.9
- Press: translateY(1px)

### Links / Interactive Text
- Default: `#6B7280` (gray)
- Hover: `#1A6FD4` (blue)
- Transition: color 150ms

### Input Fields
- Height: 44px
- Border: 1.5px solid `#1A6FD4` (focused) or `#D0E3F7` (unfocused)
- Border radius: 4px
- Font: 15px
- Padding: 12px 16px

---

## 11. Dark Overlay

Used behind mega dropdowns and mobile sidebars:
```
Background: rgba(0, 0, 0, 0.45)
Covers full viewport (fixed inset-0)
```

---

## 12. Chart Colors

### Customer Portal Charts
Not currently implemented in customer view.

### Seller Portal Charts
- Line/Area: `#6C47FF` (stroke 2.5px)
- Fill gradient: `#6C47FF` @ 20% opacity → 0% opacity
- Grid: `#E5E3FF`
- Axis labels: `#6B7280` @ 12px

### Admin Portal Charts
- Line/Area: `#111111` (stroke 2.5px)
- Fill gradient: `#111111` @ 10% opacity → 0% opacity
- Bar fill: `#111111`, radius: [0, 6, 6, 0]
- Grid: `#E5E7EB`
- Axis labels: `#6B7280` @ 12px
- Pie chart: `#111111`, `#9CA3AF`, `#EF4444`, `#D1D5DB`

---

## 13. Quick Reference - Customer Portal (Primary Target)

```
Primary blue:       #1A6FD4
Yellow CTA:         #FFCC00
Text dark:          #1A1A2E
Text secondary:     #4B5563
Text muted:         #9CA3AF
Background:         #FFFFFF
Card background:    #FFFFFF
Border:             #E8EEF4
Blue tint:          #EAF2FF
Success green:      #22C55E
Warning amber:      #F59E0B
Error red:          #EF4444

Font:               Roboto
Nav text size:      15px / Medium
Heading size:       20px / Bold
Body size:          14px / Regular
Small text:         13px / Medium

Card radius:        14px
Button radius:      10px
Input radius:       4px

Content max-width:  1280px
Horizontal padding: 24px
Nav row 1 height:   56px
Nav row 2 height:   72px
Button height:      44px
```
