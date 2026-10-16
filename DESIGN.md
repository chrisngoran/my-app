---
name: Green Venture Cooperative Coffee
description: Traceable highland Arabica from smallholder families in Kumbo, Cameroon, ordered on WhatsApp and paid by mobile money.
colors:
  background: "#fbf8f4"
  foreground: "#2a1d16"
  surface: "#ffffff"
  muted: "#7a6a5f"
  border: "#e7ddd3"
  brand: "#4a2c20"
  brand-contrast: "#ffffff"
  accent: "#2f6b3f"
  accent-soft: "#e5f0e7"
  warm: "#c27a34"
  sand: "#e9c79c"
  whatsapp: "#1f8a4c"
  whatsapp-deep: "#19733f"
  mtn: "#ffcc00"
  orange-money: "#ff7900"
  danger: "#b91c1c"
typography:
  display:
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif"
    fontSize: "clamp(2.25rem, 6vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.15
  headline:
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "0.025em"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  gutter: "16px"
  card: "20px"
  section-sm: "40px"
  section: "56px"
  section-lg: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-contrast}"
    rounded: "{rounded.lg}"
    padding: "12px 28px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brand}"
    rounded: "{rounded.lg}"
    padding: "12px 28px"
    height: "48px"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "{colors.brand-contrast}"
    rounded: "{rounded.lg}"
    padding: "10px 24px"
    height: "44px"
  button-trace:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.brand-contrast}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
    height: "44px"
  chip-note:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "8px 16px"
    height: "40px"
  chip-filter-active:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-contrast}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "44px"
---

# Design System: Green Venture Cooperative Coffee

## Overview

**Creative North Star: "The lot ledger on the hillside"**

The current site reads like a warm, well-kept cooperative shop. It uses roasted-coffee browns, a coffee-leaf green and a sun-orange on a light parchment page. Serif headlines give it a printed, agricultural feel. A system sans handles the working text. Content sits on soft white cards with large radii, and the product imagery is a consistent family of illustrated coffee bags on hill backgrounds. The traceability pages are the most distinctive part: they use a dark brand-brown hero, a cupping-score ring, monospace lot codes and a printable bag label.

The page is light, chosen for the use scene: phones outdoors and in shops, in bright ambient light, on modest screens. Density is low on Persuade pages (home, our story) and moderate on Read/Operate pages (lot record, cart, admin). Everything is drawn in inline SVG or CSS, with no web fonts and no images heavier than the product illustrations. That is a deliberate performance stance.

**Key Characteristics:**
- Coffee brown (`brand`) carries authority: headlines, primary buttons and dark bands.
- Leaf green (`accent`) carries provenance and "go": trace actions, tasting notes, positive states and links.
- Sun-orange (`warm`) is decoration and a scarcity signal ("Only N left", the cupping ring, step numbers). It is not a text colour on light surfaces.
- Serif display over a system sans, with monospace only for lot codes and URLs (real data, not decoration).
- Rounded white cards on parchment, with 1px warm borders and very soft shadows.

## Colors

The palette is earthy and warm: browns and leaf green on parchment, plus third-party brand colours for WhatsApp and the mobile-money operators.

### Primary
- **Roasted Brown** (`--brand` #4a2c20): Headlines, primary buttons, the "My order" pill, the demo banner, dark hero bands on `/trace`, the trace-teaser band on home and admin chrome. White text on it reaches 12.6:1.

### Secondary
- **Coffee Leaf** (`--accent` #2f6b3f): Links, the trace CTA, "Continue to send order", tasting-note chips (on `--accent-soft`), "In stock", toggles and success toasts. It reaches 6.4:1 on white and 5.5:1 on `--accent-soft`.
- **Leaf Mist** (`--accent-soft` #e5f0e7): Chip and callout backgrounds, the image well behind product art, and the "Where this coffee comes from" panel.

### Tertiary
- **Highland Sun** (`--warm` #c27a34): The cupping-score ring stroke, step-number discs on the brown band, the hero-art sun and the low-stock dot. It **fails as text** on light surfaces (3.4:1 on white, 3.2:1 on parchment) and as a background behind small white text (3.4:1). Today it is misused as text in "Only N left" and the admin "Edited" chip, and as the background of the admin demo banner.
- **Sand** (#e9c79c, hard-coded): The eyebrow text on the brown band on home (7.8:1). It is not yet a token.

### Neutral
- **Parchment** (`--background` #fbf8f4): The page background.
- **Bean Black** (`--foreground` #2a1d16): Body text, at 15.4:1 on parchment.
- **Paper** (`--surface` #ffffff): Cards, the header, the footer and inputs.
- **Husk** (`--muted` #7a6a5f): Secondary text, at 4.9:1 on parchment and 5.2:1 on white. That is the floor, so never lighten it or put it on tinted fills darker than `--accent-soft` (4.4:1 there, which fails).
- **Chaff** (`--border` #e7ddd3): 1px borders, dividers and the skeleton fill (`bg-border/50`).

### Third-party (not brand, used as-is)
- **WhatsApp green** (#1f8a4c, hover #19733f, hard-coded in 3 files): White text on it is 4.4:1, just under AA for 16px semibold. Move the base to #19733f.
- **MTN yellow** (#ffcc00 with #1a1a1a text) and **Orange Money** (#ff7900 with white text, **2.6:1, fails**) in `payment-badges.tsx`.
- **Danger**: Tailwind `red-700` / `red-600` / `red-50` / `red-200`, used ad hoc. It is not tokenised.

### Named Rules
**The Leaf Means Go Rule.** Green is the colour of moving forward toward provenance or ordering. Brown is the colour of the brand's own voice. Do not use green as decoration on brown or as a third headline colour.

**The Sun Is Not Ink Rule.** `--warm` is used for fills, rings and dots, never for text on a light surface. For a warm text colour, use a darkened `--warm-ink` (target ≥ 4.5:1, for example #8f5420).

## Typography

**Display font:** `--font-serif`: `ui-serif, Georgia, Cambria, "Times New Roman", serif`. On Android this resolves to Noto Serif, and on desktop to Georgia, New York or Cambria.
**Body font:** `--font-sans`: the system UI stack (Roboto on Android, Segoe on Windows, SF on Apple).
**Data font:** the Tailwind default `font-mono`, for lot codes, trace URLs and the lot-code input.

**Character:** A sturdy bookish serif in bold for headlines, over a neutral system sans. It is traditional and agricultural without being rustic, costs nothing to download, and works offline. Keep it: a web font would cost slow-network users more than it would gain.

### Hierarchy
- **Display** (serif 700, `text-4xl` → `sm:text-5xl`, 36 → 48px, `leading-tight`): Page h1s on home, our story and the trace pages.
- **Headline** (serif 700, `text-3xl`, 30px): Section h2s and the shop, cart and order h1s (`text-3xl sm:text-4xl`).
- **Title** (serif 700, `text-lg` to `text-xl`): Card titles (products, farmers, values) and panel headings ("Order summary", "Your details").
- **Body** (sans 400, 16px; `text-lg` 18px for lead paragraphs, `leading-relaxed`): The lead text is often `text-foreground/80`, an opacity tint and not a token.
- **Small** (sans 400, `text-sm` 14px, usually `text-muted`): Meta lines, hints and footer links.
- **Label / eyebrow** (sans 600, `text-xs` or `text-sm`, `uppercase tracking-wider`, `text-accent`): Used above almost every heading ("FROM THIS HARVEST", "THE SHOP", "OUR STORY", "HOW IT WORKS", "MEET THE FARMERS"). The target direction removes this.
- **Micro** (`text-[10px]` uppercase): The "SCA" label and "of 100 pts" in the gauge. This is below the legibility floor on phones.

### Named Rules
**The One Voice per Heading Rule** *(target)*. A heading stands on its own. Delete the uppercase eyebrow above it, and where the eyebrow carried a fact (a place, a harvest year), fold it into the heading or the lead.

## Layout

- **Container:** `mx-auto max-w-6xl px-4` (1152px, 16px gutters) on every storefront and trace page. Admin uses `max-w-3xl`. Reading text is capped at `max-w-xl` / `max-w-2xl` (≈ 60–70ch).
- **Grid:** One column on mobile. Product and farmer grids use `sm:grid-cols-2 lg:grid-cols-3`. Two-column page splits (hero, product detail, cart/order with a 340–360px sticky aside) start at `lg`.
- **Vertical rhythm:** Sections use `py-12`/`py-14` and grow to `sm:py-16` (56–64px). Cards use `p-4`/`p-5`/`p-6`. The gap inside a card grid is `gap-5`. The rhythm is fairly uniform, almost metronomic: every section has the same padding and the same eyebrow-heading-lead-grid stack.
- **Mobile header:** It wraps to three rows (logo / currency + My order / nav) and takes about 180px with the demo banner. The nav links are 20px tall.
- **Footer:** `mt-16` plus its own padding, which leaves a large empty gap after short pages (cart, order).

## Elevation & Depth

Mostly flat tonal layering: white cards on parchment with 1px `--border`. Shadows are Tailwind defaults and used sparingly.

### Shadow Vocabulary
- **Resting card** (`shadow-sm`): Product cards, farmer cards and payment badges.
- **Hover lift** (`hover:shadow-md`): Product cards, trace lot cards and lot-product cards.
- **Floating panel** (`shadow-lg` / `shadow-xl`): The home trace-teaser card, the `/trace` "Find your lot" card and toasts.

### Named Rules
**The Flat-at-Rest Rule.** Surfaces are flat or carry `shadow-sm` at rest. Stronger elevation is reserved for a panel that overlaps a band (the lot finder, the facts strip) or for transient UI (toasts).

## Shapes

- **Radii in use:** `rounded-md` (6px: the currency select, trace CTAs, lot-search input and button, print button), `rounded-lg` (8px: most buttons, inputs, stepper), `rounded-xl` (12px: trace lot cards, the quality tiles), `rounded-2xl` (16px: cards, panels, summary asides), `rounded-3xl` (24px: the product image well, CTA bands, the gauge frame) and `rounded-full` (chips, pills, avatars, step discs).
- **Drift:** The trace area uses `rounded-md` buttons with no `min-h` (36–40px tall), while the storefront and admin use `rounded-lg` with `min-h-11`/`min-h-12`. Pick one button radius (`lg`).
- **Signature shapes:** The layered hills (in `HeroArt`, `HillsBackdrop` and the product illustrations), the coffee-leaf ellipse in the CTA band, and the cupping-score ring.

## Components

### Buttons
- **Shape:** `rounded-lg` (8px).
- **Primary:** `bg-brand text-brand-contrast font-semibold`, `min-h-12 px-7` on marketing CTAs and `min-h-11 px-4` in cards. Hover is `bg-brand/90`. There is no `:active` state, no shared component, and the classes are duplicated inline about 15 times. Admin has `primaryButton` / `secondaryButton` strings in `src/components/admin/ui.tsx`.
- **Secondary:** `border border-brand/30 bg-surface text-brand`, with `hover:border-brand`.
- **Go / provenance:** `bg-accent` ("Continue to send order", "Trace this coffee", "Trace my coffee").
- **WhatsApp:** `bg-[#1f8a4c]`, full width, on the product page and the order page.
- **Focus:** `focus-visible:outline-2 outline-offset-2 outline-accent` appears on some buttons only. Header links, hero CTAs, footer links, cart/order CTAs and the trace page CTAs rely on the browser default ring.

### Chips
- **Tasting note:** `bg-accent-soft text-accent rounded-full px-2.5 py-0.5 text-xs`.
- **Category filter:** a pill toggle with `aria-pressed`, white with a border at rest and filled brown when pressed, `min-h-10` (40px). The row scrolls horizontally on mobile.
- **Category badge on images:** `bg-surface/90 rounded-full text-xs text-brand`.

### Cards / Containers
- **Corner style:** `rounded-2xl` (16px).
- **Background:** `--surface` on `--background`. The image well is `--accent-soft`.
- **Border:** `1px --border`.
- **Internal padding:** 16–24px.
- **Use:** Nearly every content block is a card, including values, journey steps, farmers, quality tiles and the QR block. Some are nested: quality tiles sit inside the quality card, and fact tiles inside farmer cards.

### Inputs / Fields
- **Style:** `rounded-lg border-border bg-surface min-h-11` (storefront) or `min-h-12` (admin), at 16px (no iOS zoom).
- **Focus:** `focus:border-accent focus:ring-2 focus:ring-accent/30`. The lot search uses `rounded-md` and `outline-accent/30` instead.
- **Error:** `aria-invalid` plus `red-700` helper text in admin. The order form has no inline errors: the send button is replaced by a grey hint until the fields are valid.
- **Radios:** native, and they render in browser-default blue because `accent-color` is not set.

### Navigation
- **Storefront header:** white bar under a brown demo strip. It holds the serif logo with "Coffee" in leaf green, three text links (`text-foreground/80`, `hover:text-brand`, with no active state and no `aria-current`), the currency `<select>` and a brown "My order (n)" pill.
- **Admin header:** a warm-orange demo strip (white text, 3.4:1, which fails) over a brown header with a 3-up grid of segmented nav buttons. The active item is white with brown text.

### Signature: Cupping Score Ring
An SVG ring (`src/components/trace/cupping-score.tsx`) that maps 70–95 points to a full circle in `--warm` on a 15% track, with a large serif score and a grade pill. It appears in the dark lot hero.

### Signature: Bag Label
A 100 × 150 mm printable label (`/trace/[code]/label`) laid out in container-query units, with a brown brand band, the product name, an origin grid, the QR code and the lot code.

## Target direction (recommended for the polish pass)

This is a refinement of the incumbent world, not a redesign. Keep the palette, the serif/sans pairing, the illustrated bags and the hill motif.

1. **Tokenise what is hard-coded.** Add `--warm-ink` (#8f5420, for warm text), `--sand` (#e9c79c), `--whatsapp` (#19733f) / `--whatsapp-hover` (#145c33), `--danger` (#b42318) / `--danger-soft` (#fdecea), and a focus token `--ring: var(--accent)`. Add motion tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--dur-press: 140ms`, `--dur-ui: 200ms`, `--dur-enter: 260ms`.
2. **Base layer in `globals.css`.** A global `:focus-visible` ring (2px `--ring`, 2px offset, with a white variant on brown bands), `accent-color: var(--accent)` for radios and checkboxes, a `::selection` tint in leaf mist, `text-underline-offset: 3px`, `font-variant-numeric: tabular-nums` on prices and quality data, `scroll-padding-top`, `-webkit-tap-highlight-color: transparent` (paired with a visible `:active` state), and a `prefers-reduced-motion` block that drops transforms and keeps fades.
3. **One button vocabulary.** Shared class recipes (`btn`, `btn-primary`, `btn-secondary`, `btn-go`, `btn-whatsapp`) with `min-h-11` (44px), `rounded-lg`, focus ring and `:active { transform: scale(0.97) }`. The storefront, trace and order surfaces all use them.
4. **Drop the eyebrows.** Remove the uppercase kicker above headings across the site. Keep only the location pill in the home hero if it carries meaning, and make it a single line.
5. **Fewer, better cards.** Turn "Our story" values and the trace "How it works" steps from same-size boxed cards into typographic lists or a connected timeline, and un-nest the tiles inside cards. Keep cards for things you can pick up: products, lots and farmers.
6. **A compact mobile header.** Two rows at most: logo with the currency and order pill, then the nav as 44px-tall links with `aria-current`.

## Do's and Don'ts

### Do:
- **Do** keep text at ≥ 4.5:1. `--muted` (#7a6a5f) is the lightest allowed text on white or parchment.
- **Do** give every tappable element a 44px minimum height on mobile, including inline text links in footers and breadcrumbs (pad them with `py-3` or `min-h-11 inline-flex`).
- **Do** use `font-mono` only for lot codes, URLs and the lot-code input.
- **Do** keep illustrations as inline SVG and product images at their current size: no photos heavier than ~60 KB and no external fonts.
- **Do** keep the demo disclaimers (the header strip, "Farmer names … are illustrative" and the admin strip) visible.

### Don't:
- **Don't** set `--warm` text on light surfaces, or small white text on `--warm` or Orange-Money orange.
- **Don't** add uppercase eyebrows above headings.
- **Don't** use `transition` (all) or animate `gap`, `height`, `padding` or `box-shadow` on lists. Animate `transform` and `opacity`.
- **Don't** add hover-only affordances without `@media (hover: hover) and (pointer: fine)`.
- **Don't** introduce a new radius (stick to `lg` for controls, `2xl` for cards and `3xl` for bands and images).

## Polish-pass decisions (recorded after implementation)

- **Wording:** the customer's basket is the "order list". Header: "My order"; product button: "Add to order"; `/cart` h1: "Your order list"; back link: "Back to your order list". Do not reintroduce "cart" in visible copy.
- **Danger colour:** `--danger` / `--danger-soft` (Tailwind `text-danger`, `bg-danger-soft`) replace every `red-*` literal, including the admin confirm dialog and form errors.
- **Buttons:** every button is built from `.btn` + one of `btn-primary`, `btn-secondary`, `btn-go`, `btn-whatsapp` (optionally `btn-lg`) in `globals.css`; admin's `primaryButton` / `secondaryButton` and the trace recipes are aliases of these.
- **Motion:** `--ease-out` everywhere; transform and opacity only (plus the one-off cupping-ring stroke draw); hover effects only for fine pointers; reduced motion keeps short fades and drops movement.
