---
name: GREENVENTURES Cooperative Society Ltd
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

# Design System: GREENVENTURES Cooperative Society Ltd

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

## Direction v2

*Creative direction for the second design pass. It replaces the "Target direction" above and keeps everything in "Polish-pass decisions". Inputs: frontend-design, Impeccable (typeset, colorize, delight, bolder, craft-floor, Operate/Persuade modes; the launcher was not run, so the context came from PRODUCT.md and this file) and apple-design. BEFORE screenshots: `scratchpad/screens/v2-before/` (390×844 and 1280×800).*

### What the BEFORE screenshots show

The site works, but it sits on the generic default. It has a warm cream page (#fbf8f4), a bold serif display, a brown-and-terracotta accent and a green CTA band with a decorative leaf. Every product, lot and farmer is a white rounded card with the same `shadow-sm`. The home page has a hero-metric strip ("1,600–2,000 m / 6+ / 4 / 100%"). Meta strings use middle dots ("Kumbo · Bui Division · North West Cameroon", "250 g · Light roast", "Natural · Java", "4 500 FCFA · 120 in stock"). Links end in arrows ("See all products →", "See the full journey of this lot →", "Buy →"). The trace page uses uppercase tracked labels (VERIFIED LOT, HARVESTED, MOISTURE). The admin product list nests bordered toggle boxes inside bordered cards. Little of it could only belong to Kumbo.

### Concept: "Six farms on one ridge"

The identity comes from things that exist in the Bui highlands coffee world:
- **ripe coffee cherry**, a deep crimson, used as the colour of committing to buy;
- **dark volcanic soil**, used as the ground the page stands on (hero base, trace hero, footer);
- **morning mist on the hills**, used as the page itself, a cool grey-green instead of cream;
- **sun-dried parchment coffee and raised drying beds**, used as the lot record;
- **the stencilled marks on export sacks**, a lot code painted in a stencil face, used only for lot codes;
- **the cooperative's people**, shown as real data: the member farms plotted by altitude on one ridge line.

The page does not use Nso royal or society regalia, ndop or toghu patterns, or any ceremonial symbol, as ornament or as texture. The motifs are only hills, contour lines, cherries, mist and stencil lettering.

### Pass 1 → pass 2 review (what changed and why)

| Pass-1 idea | Verdict | Pass-2 decision |
|---|---|---|
| Parchment-cream page with a jute-sack texture in the hero | Cream is calibration tell #1. A woven texture is a costume, and it costs bytes and contrast. | The page is **Highland Mist #EEF1EB** (cool green-grey). Parchment is only a *fill* for the lot tag. No textures. |
| Keep a bold serif display and add a stencil for headings | A serif display on a light page is the tell. A stencil for headings is a costume and hard to read. | **Archivo** (variable width and weight): condensed heavy grotesque for headings, normal width for body. The stencil (**Big Shoulders Stencil**) is used **only for lot codes**, which really are stencilled on sacks. |
| Terracotta/orange accent for CTAs | It is close to #D97757, the Claude tell. | **Ripe Cherry #8C1D33**, a crimson with a purple lean, kept clearly apart from Danger #B42318 (orange-red). |
| Hero: big headline plus a stats strip | The hero-metric template. | Hero: **an altitude ridge drawn from the real farmer data** in `data.ts`. The stats strip is deleted, and its facts move into the ridge and the lead. |
| Lot search kept on /trace only | It misses the one proof that only this co-op has. | A **working lot-code search** in the hero's soil band ("Have a bag?"). It is the Persuade action in its working form, beside "Shop the harvest". |
| Numbered 1/2/3 discs everywhere | A sequence marker on non-sequences. | Numbers only where order is real: the journey on Our story, the lot journey on trace and the 3 scan steps. Each uses a single "rail" pattern. |
| Mist bands that drift on loop | A slow loop is vestibular noise (apple-design §14) and costs CPU. | Mist bands are **static**. The one load moment is the cherries ripening (Delight 1). |

### Colour: tokens mapped onto the existing names

Light theme only, chosen for the use scene (phones outdoors and in shops, bright light). Neutrals take a green-grey tint from the mist. The dark colour takes its tint from the soil.

| Name | Hex | Token(s) | Role |
|---|---|---|---|
| **Highland Mist** | `#EEF1EB` | `--background` | Page ground, header, chips at rest |
| **Cloud** | `#FFFFFF` | `--surface`, `--brand-contrast` | Inputs, order summary, admin rows, text on dark |
| **Volcanic Soil** | `#33221B` | `--brand` | Headings, dark bands (hero base, trace hero, footer, admin header), secondary button text and border |
| **Basalt Ink** | `#231A16` | `--foreground` | Body text |
| **Ripe Cherry** | `#8C1D33` | **new** `--cherry`; `--warm` and `--warm-ink` → `var(--cherry)` | Primary "commit" actions (`.btn-primary`), the order pill, low-stock text, ridge farm dots |
| **Shade Leaf** | `#22573A` | `--accent` (+ `--ring`) | Links, trace actions (`.btn-go`), toggles, success, focus ring |
| **Sun-dried Parchment** | `#EADCC0` | `--sand` | Lot-tag fill, image lot tags, text and focus ring on Volcanic Soil, admin demo strip |

Support values: `--muted #545C55` (Lichen), `--border #CDD5CA` (decorative hairlines only), **new** `--field-border #7C857C` (input, stepper and off-toggle edges), `--accent-soft #DCE7DA`, **new** `--cherry-hover #6E1628`, **new** `--cherry-lift #E9707A` (cherry on soil: cupping ring, ridge dots on dark), **new** `--mist-on-soil #C9D2C6` (secondary text on soil). Kept as they are: `--whatsapp #19733F`, `--whatsapp-hover #145c33`, `--danger #B42318`, `--danger-soft #FDECEA`, MTN #FFCC00 and Orange #FF7900 (marks only).

Measured contrast (WCAG 2.x):

| Pair | Ratio | Use |
|---|---|---|
| Basalt Ink on Mist / on Cloud | 14.96 / 17.06 | body |
| Volcanic Soil on Mist | 13.29 | headings |
| Lichen (muted) on Mist / Cloud / Leaf-soft / Parchment | 6.06 / 6.91 / 5.42 / 5.10 | meta text |
| Shade Leaf on Mist / Cloud / Leaf-soft / Parchment | 7.39 / 8.43 / 6.61 / 6.22 | links, chips |
| White on Shade Leaf | 8.43 | `.btn-go` |
| White on Ripe Cherry | 8.98 | `.btn-primary`, order pill |
| Ripe Cherry on Mist / Cloud / Parchment | 7.88 / 8.98 / 6.63 | "Only N left", lot code on tag |
| White on Cherry hover #6E1628 | 11.61 | hover |
| Parchment on Volcanic Soil | 11.19 | text and focus ring on dark bands |
| Mist-on-soil #C9D2C6 on Soil | 9.76 | secondary text on dark |
| Cherry-lift #E9707A on Soil | 5.10 | cupping ring, ridge dots on dark (≥ 3:1 graphic) |
| Danger on Cloud / on Danger-soft | 6.57 / 5.75 | errors |
| White on WhatsApp #19733F | 5.89 | WhatsApp button |
| Field-border #7C857C on Cloud | 3.82 | input boundaries (≥ 3:1) |

Colour rules:
- **Cherry Commits.** Cherry is for actions that add or buy: "Add to order", "Shop the harvest", "Continue to send order", "Start a new order", admin "Save changes", and the "My order" pill. Cherry never appears near an error. Errors always carry text and an icon, never colour alone.
- **Leaf Traces.** Leaf green is for provenance and links: "Trace a lot", "Trace this coffee", inline links, toggles on, success toasts.
- **Soil Grounds.** Volcanic Soil fills only full-bleed bands: the hero base, the trace hero, the footer and the admin header. It never fills a rounded floating card.
- **Parchment is the record.** The only parchment fills are the lot tag (product page, home trace band, bag label) and the small lot tags on product images.
- Browser surfaces: `::selection { background: var(--sand); color: var(--foreground) }`, `caret-color: var(--cherry)` on inputs and textareas, `accent-color: var(--accent)`, `scrollbar-color: var(--field-border) transparent`, and the focus ring 2px `--ring` with 2px offset (on `.on-dark`: `var(--sand)`, not white).

### Type

Two families, both through `next/font/google`. They are downloaded and self-hosted at build: the browser never contacts Google (`node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`). Options checked in `.../02-components/font.md` for Next 16.4: `subsets`, `display` (default `'swap'`), `axes` (variable fonts only), `variable` (CSS variable method), `preload` (default true, applied per file where the loader is called; in the root layout it preloads on every route), `fallback`, and `adjustFontFallback` (default true for Google fonts: a metric-adjusted fallback against CLS). Archivo's variable axes in this Next build are `wdth 62–125` and `wght 100–900`. Big Shoulders Stencil has `opsz 10–72` and `wght 100–900`.

```ts
// src/app/fonts.ts (new; one definitions file, per the docs)
import { Archivo, Big_Shoulders_Stencil } from "next/font/google";
export const archivo = Archivo({
  subsets: ["latin"], display: "swap", axes: ["wdth"], variable: "--font-archivo",
  fallback: ["system-ui", "Roboto", "Arial", "sans-serif"],
});
export const stencil = Big_Shoulders_Stencil({
  subsets: ["latin"], display: "swap", weight: "800", variable: "--font-stencil-face",
  preload: false, // used only for lot codes; not worth a preload on every route (admin, cart)
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});
```

`layout.tsx`: `<html lang="en" className={`${archivo.variable} ${stencil.variable} h-full antialiased`}>`. `globals.css` `@theme inline`: `--font-sans: var(--font-archivo), ui-sans-serif, system-ui, Roboto, Arial, sans-serif;` `--font-serif: var(--font-sans);` (a temporary alias, so untouched `font-serif` classes still work), `--font-stencil: var(--font-stencil-face), "Arial Narrow", sans-serif;`. **Verify after the build:** the generated `@font-face` for Archivo must declare a `font-stretch` range. If it does not, the `type-*` utilities use `font-variation-settings: "wdth" N` instead of `font-stretch`. Budget: Archivo latin woff2 ≤ 90 KB, checked in `.next/static/media`. If it is over budget, drop `axes` and load `Archivo_Narrow` (weight 700) for headings instead.

**Roles:** Archivo for everything people read. Width is the hierarchy device: condensed for headings, 100% for reading. Stencil only for lot codes shown at ≥ 18px. The lot-code `<input>` and trace URLs stay `font-mono` (exact characters matter there). No italics are loaded. No uppercase labels, except the lot code itself (it is uppercase data).

Scale, defined as `@utility` classes in `globals.css` (Impeccable typeset: fewest roles; Apple: tracking tightens as size grows, leading tightens inversely):

| Utility | Size (mobile → desktop) | Line height | Weight | Width (`font-stretch`) | Tracking | Use |
|---|---|---|---|---|---|---|
| `type-display` | `clamp(2.5rem, 7.5vw + 1rem, 5rem)` (45px @390, 80px max) | 0.98 | 800 | 72% | -0.02em | home h1 only |
| `type-h1` | `clamp(2rem, 3vw + 1.25rem, 3.25rem)` | 1.02 | 800 | 78% | -0.015em | page h1s (shop, product, cart, order, our story, trace, label) |
| `type-h2` | `clamp(1.5rem, 1.5vw + 1.1rem, 2.25rem)` | 1.08 | 750 | 85% | -0.01em | section h2s |
| `type-title` | 1.1875rem (19px) | 1.25 | 700 | 92% | 0 | card/product titles, panel headings, farmer names |
| `type-lead` | 1.125rem (18px) | 1.55 | 400 | 100% | 0 | lead paragraphs, `max-w-[60ch]`, `text-foreground` (no `/80` tints) |
| body (base) | 1rem | 1.6 | 400 | 100% | 0 | prose |
| `text-sm` meta | 0.875rem | 1.45 | 450 | 100% | 0.005em | meta, hints, footer |
| `type-label` | 0.875rem | 1.3 | 600 | 100% | 0.01em | form labels, `dt`, sentence case |
| `type-data` | inherits size | 1.2 | 700 | 92% | 0 | prices, scores, measures, always `tabular-nums` |
| `type-stencil` | ≥ 1.125rem; 1.5rem on tags; 3–3.5rem in the trace hero | 1 | 800 | n/a | 0.04em | lot codes only |

On Volcanic Soil, light text gets weight +50 (body 450, meta 500) and +0.01em tracking. Nothing is smaller than 12px: the gauge's `text-[10px]` becomes `text-xs`. Headings get `text-wrap: balance` and paragraphs `text-pretty`. Leave 1.5× more space above a heading than below it.

### Shape, depth, motion

- **Radii by hierarchy:** controls `rounded-lg` (8px: buttons, inputs, filter chips, stepper), image wells and lot tag `rounded-2xl` (16px), full-bleed bands 0 (no more `rounded-3xl` bands). `rounded-full` only for the count badge, status dots, avatars and farm dots. Filter chips become 8px, not pills.
- **Depth:** flat at rest. No `shadow-sm` on cards. One token, `--shadow-float: 0 10px 28px -12px rgb(35 26 22 / 0.35)`, for toasts and the sticky mobile purchase bar only.
- **Motion:** the existing tokens (`--ease-out`, `--dur-press 140`, `--dur-ui 200`, `--dur-enter 260`). Transform, opacity and (Delight 1 only) `background-color` on six 10px dots. Hover effects only under `(hover: hover) and (pointer: fine)`. Press feedback on pointer-down (`.btn:active scale(.97)`, already in place).

### Delight: exactly three moments

1. **The cherries ripen (home hero, once per load).** The six farm dots on the ridge start leaf green (`--accent`) and turn cherry (`--cherry`) one after another, from the lowest farm to the highest. Each takes `var(--dur-enter)` (260ms) with `var(--ease-out)`, a 90ms stagger and a 150ms initial delay, so the whole moment lasts about 860ms. CSS only: `@keyframes gv-ripen { from { background-color: var(--accent); transform: scale(.7) } }` with `animation: gv-ripen var(--dur-enter) var(--ease-out) calc(150ms + var(--i) * 90ms) both`. The resting style is the final cherry, so the dots are never hidden without CSS. Reduced motion: no animation, final colour shown. Nothing waits for it.
2. **The cupping ring (trace hero, existing, kept and recoloured).** The ring now draws in `--cherry-lift` on Volcanic Soil, over 600ms with `--ease-out`, starting from `@starting-style` (as it does now). The score number fades in with `anim-swap` (180ms) when the stroke starts, so the number appears with the ring. Reduced motion: ring and number are static.
3. **"From your town to Kumbo" (order sent screen).** After "Send order on WhatsApp", the thank-you heading uses the town the buyer typed: **"Thank you. Your order is on its way from {city} to Kumbo."** If the town is empty, it falls back to the current copy ("Thank you, your order is on its way to us"). Below it, a 1px dashed Volcanic Soil line joins a leaf dot (the town) to a cherry dot labelled "Kumbo". The line draws once (`clip-path: inset(0 100% 0 0)` → `inset(0)`, 400ms `--ease-out`) and the panel itself uses `anim-enter`. Reduced motion: the line is drawn, with a 150ms fade. It adds no claims and no timing promises. The WhatsApp message text is not touched.

Not added: confetti, sounds, haptics, scroll-reveal on sections, hover lift on cards.

### Remove (generic tells)

- Middle-dot meta strings everywhere in the storefront, trace and admin: write them as prose with commas ("250 g, light roast"; "Natural process, Java"; "Meluf, Kumbo"; "Tobin, member since 2019"), or as separate spans with `gap-x-4`. Leave `<title>` templates alone (browser chrome).
- `→` / `←` glyphs on links ("See all products →", "See the full journey of this lot →", "Buy →", the product-purchase arrow, "← Back to your order list"). Links are plain words, underlined. Where a direction cue helps (the back link), use an authored 16px chevron SVG.
- The hero eyebrow pill ("● Kumbo · Bui Division · North West Cameroon"); its facts move into the lead. The trace hero pill "VERIFIED LOT · GV-…" is replaced by the stencil lot code. Uppercase tracked `dt` labels on trace (HARVESTED, MOISTURE …) and "SCA CUPPING SCORE" become sentence case.
- The home stats strip (hero-metric template).
- Identical white rounded cards with `shadow-sm` / `hover:shadow-md` for products, farmers, trace lot products and the QR block. Cards remain only for the order summary (a receipt) and admin form panels.
- The leaf-ellipse decoration and green rounded CTA band on home. The `bg-gradient-to-b from-accent-soft/60` hero washes (home, our story).
- The one-word colour accent in the logo ("GREENVENTURES **Coffee**" in green).
- Rotating avatar colours on Our story (`AVATAR_COLOURS`). Nested bordered toggle boxes inside admin cards.
- Cupping-note chips on product *cards* (they stay as chips on the product page only).

---

### STOREFRONT

*Owns: `src/app/globals.css`, `src/app/fonts.ts` (new), `src/app/layout.tsx`, `site-header.tsx`, `site-footer.tsx`, `src/app/page.tsx`, `hero-art.tsx` (rewritten as the ridge), `/shop`, `/shop/[slug]`, `/our-story`, `product-card.tsx`, `shop-catalog.tsx`, `product-purchase.tsx`, `stock-indicator.tsx`, `payment-badges.tsx`, `add-to-cart-button.tsx`, `live-catalog.tsx`. Mode: Persuade (home, our story), Read/Persuade (shop, product).*

**S1. Tokens (`globals.css`).**
- `:root` values as in the colour table. Add `--cherry #8C1D33`, `--cherry-hover #6E1628`, `--cherry-lift #E9707A`, `--field-border #7C857C`, `--mist-on-soil #C9D2C6`, `--shadow-float`. Set `--warm: var(--cherry)` and `--warm-ink: var(--cherry)` (existing users such as the stock indicator, admin chips and gauge now resolve to cherry). Register `--color-cherry`, `--color-cherry-hover`, `--color-cherry-lift`, `--color-field-border`, `--color-mist-on-soil` and `--font-stencil` in `@theme inline`.
- `.btn-primary { background: var(--cherry) }`, hover `var(--cherry-hover)`. `.btn-secondary { border: 1.5px solid var(--brand); color: var(--brand); background: transparent }`, hover `background: color-mix(in oklab, var(--brand) 6%, transparent)`. New `.btn-on-dark { background: var(--sand); color: var(--brand) }`, hover `#f3e9d6`, for actions on soil bands. Replaces the ad-hoc `bg-surface text-brand hover:bg-accent-soft`.
- `.on-dark :focus-visible { outline-color: var(--sand) }`.
- Base layer: `::selection` parchment; `input, textarea { caret-color: var(--cherry) }`; `html { scrollbar-color: var(--field-border) transparent }`; `body { font-family: var(--font-sans); font-stretch: 100% }`.
- `@utility type-display | type-h1 | type-h2 | type-title | type-lead | type-label | type-data | type-stencil` per the type table. `@keyframes gv-ripen` and `.anim-ripen`, with a reduced-motion override of `animation: none`.

**S2. Fonts (`fonts.ts`, `layout.tsx`).** As specified in Type. Root `<html>` gets both `.variable` classes. Leave the skip link as it is (it inherits Archivo).

**S3. Header.**
- Demo strip: `bg-brand text-sand text-xs py-1.5`, copy unchanged.
- Bar: `bg-background border-b border-border` (mist, not white).
- Logo: a 22px authored SVG mark (two cherries, `--cherry`, on a short leaf stroke, `--accent`; no other ornament) and the word mark "GREENVENTURES" in `type-title` 800 / `font-stretch:80%`, Volcanic Soil. "Coffee" is no longer green; the full name lives in the footer.
- Nav links 15px weight 500. Active: `text-brand font-semibold` with a 2px cherry underline (`decoration-cherry`), `aria-current` kept.
- Order pill: `bg-cherry`, the badge `bg-surface text-cherry`, `anim-pop` kept. Currency select: `border-field-border bg-surface`.
- Keep the 2-row mobile layout. Keep it at or under 100px including the strip.

**S4. Footer: the soil ground.**
- `on-dark bg-brand text-sand mt-12` (full-bleed; the hero's soil band visually returns here).
- Name in `type-title`. Location in `text-mist-on-soil`.
- "Order & pay" becomes a `<ul>` of three lines (WhatsApp or phone / MTN Mobile Money / Orange Money). No dots.
- Links `text-sand hover:underline min-h-11`. Bottom row: `border-t border-white/15 text-mist-on-soil`, with "Demo website", "Full platform preview" and "Staff login" kept.

**S5. Home hero: "Six farms on one ridge" (the boldness lives here).**

```
MOBILE 390                                   DESKTOP 1280
┌──────────────────────────────────────┐     ┌──────────────────────────────────────────────────────────┐
│ Highland Arabica,                    │     │ Highland Arabica,          │   Meluf ●                    │
│ grown by smallholders,               │     │ grown by smallholders,     │  1,900 m   Mbve ●            │
│ traceable to the hillside.           │     │ traceable to the hillside. │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (2,000 m)│
│ (type-display, soil, left-aligned)   │     │ lead (60ch)                │      ╱‾‾‾‾╲     Tobin ●      │
│ lead 18px ink, 34ch                  │     │ [Shop the harvest] [Meet…] │ ●Mbiame    ╲___ ● Kikaikelaki│
│ [■ Shop the harvest ] cherry, full-w │     │  cols 1–6                  │ ● Shisong   (ridge cols 6–12)│
│ [  Meet the farmers ] soil outline   │     ├────────────────────────────┴──────────────────────────────┤
│ 2,000 m ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │     │▓ Member farms by altitude. Sample data. ▓  Have a bag?   ▓│
│          Meluf ● 1,900               │     │▓                                       ▓ [GV-2026-___][Trace]│
│   Mbve ●            ● Tobin          │     └───────────────────────────────────────────────────────────┘
│ ●Mbiame  ╱‾‾╲___      ● Kikaikelaki  │
│ ● Shisong    (mist bands, static)    │
│ 1,600 m ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │
│▓▓▓▓▓▓▓▓ Volcanic Soil band ▓▓▓▓▓▓▓▓▓│
│ Member farms by altitude. Sample data│ (text-mist-on-soil, text-sm)
│ Have a bag? Enter its lot code       │ (type-title, text-sand)
│ [ GV-2026-014        ] [Trace]       │ (LotSearch tone="dark")
└──────────────────────────────────────┘
```

- Section `bg-background` (no gradient). Copy column: `type-display text-brand`, `type-lead`. Lead rewritten to fold in the deleted eyebrow and stats, with the same meaning: "On the volcanic slopes of the Bui highlands around Kumbo, our member families grow Arabica between 1,600 and 2,000 metres. We process and sell it together, so every family earns a fair price and every bag tells you exactly where it came from." Buttons: `btn btn-primary btn-lg` "Shop our coffee" → **"Shop the harvest"**; `btn btn-secondary btn-lg` "Meet the farmers".
- **Ridge** (`hero-art.tsx` becomes `<HeroRidge farmers={farmers} />`, a server component with no client JS). It is a `relative h-56 sm:h-72 lg:h-[26rem]` box:
  - (a) An inline SVG `viewBox="0 0 100 100" preserveAspectRatio="none"` holds two dashed contour lines at 0% and 100% (labelled "2,000 m" and "1,600 m" in HTML, `text-xs text-muted tabular`), a ridge path through the farm points (`stroke: var(--brand)`, 2px, `vector-effect: non-scaling-stroke`), and a filled area below it (`fill: var(--accent-soft)`).
  - (b) Two static mist bands: absolutely positioned 14px-high divs, `linear-gradient(90deg, transparent, rgb(255 255 255 / .55), transparent)`, at 35% and 62%.
  - (c) One absolutely positioned HTML marker per farmer at `left: x%`, `bottom: ((alt − 1600) / 400 × 100)%`. Ridge order: sort ascending, then `[a0, a2, a4, a5, a3, a1]` (lowest at the edges, highest in the middle); with the sample data this is Shisong 1,690, Mbiame 1,760, Mbve 1,850, Meluf 1,900, Tobin 1,780, Kikaikelaki 1,720. Markers sit at `x = 8 + i × 16.8`%.
  - Each marker is a 10px `rounded-full bg-cherry anim-ripen` dot (`style={{'--i': rank}}`, rank = altitude rank) with a label: village (`text-[0.8125rem] font-semibold`, `font-stretch:85%`) over altitude (`text-xs text-muted tabular`). Labels alternate above and below the dot (even ranks above, odd below), and the last one is right-aligned (`-translate-x-full`), so nothing collides at 360px. Check with a screenshot at 360 and 390.
  - The whole figure is `<figure aria-labelledby>` with a visually hidden `<ul>` listing "Meluf, 1,900 m" and so on. The visual layer is `aria-hidden`.
- **Soil band:** `on-dark bg-brand` full-bleed, `py-6`. Left: `<figcaption>` "Member farms by altitude. Sample data." Right (desktop) or below (mobile): "Have a bag? Enter its lot code" plus `<LotSearch codes={lots.map(l => l.code)} tone="dark" />` (the prop is added in the TRACEABILITY package; until it lands, render with the default tone).
- Delight 1 lives here (see Delight).

**S6. Rest of home (quiet).**
- Delete the stats `<section>`.
- **Featured coffees:** `type-h2` "Featured coffees". The "See all products →" link becomes **"All coffee"** (underlined leaf link, `min-h-11`). `ProductGrid` uses the new card (S8) in `grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3`.
- **Traceability band:** it changes from a brown band to `bg-background border-y border-border`. Left: `type-h2` "Every bag is traceable", the paragraph, and the 3 steps as a rail (a 1px `bg-border` vertical line; markers are 28px `rounded-full border-2 border-brand text-brand type-data` numbers). The steps are a real sequence, so numbers are allowed. Button: `btn btn-go btn-lg` "Trace a lot". Right: the example lot as the **lot tag** component (S9). The link copy "See the full journey of this lot →" becomes "See the full record for {code}".
- **Payment row:** h2 in `type-title`. `PaymentBadges` chips become `rounded-lg border-border bg-surface`, with the operator marks unchanged.
- **Closing CTA:** no green band and no leaf SVG. `border-t border-brand/20 pt-12`, left-aligned: `type-h2` "Taste the Bui highlands and know who grew it." (the em dash goes), the paragraph unchanged, then `btn-primary btn-lg` "Order now" and `btn-secondary btn-lg` "Start a subscription".

**S7. Shop (`/shop`, `shop-catalog.tsx`).**
- Header: `type-h1` and `type-lead`.
- Filter chips: `rounded-lg`. At rest `border border-field-border bg-transparent`; pressed `bg-brand text-brand-contrast border-brand`. Count shown as `<span class="tabular text-muted">3</span>` with no parentheses (gap-2). Keep the scroll mask, `aria-pressed`, the live region and `anim-enter`.
- Empty state: "No products in this category yet. Check back after the next harvest." (the em dash goes), plus a `btn-secondary` "Show all coffee" that calls `select(null)`.
- Grid: `gap-x-6 gap-y-10`. Mobile layout:

```
┌ image well (rounded-2xl, overflow-hidden) ──┐
│              bag illustration               │
│ [GV-2026-014]  ← parchment tag, type-stencil│
└─────────────────────────────────────────────┘
Meluf Natural Micro-lot          type-title soil
250 g, light roast               text-sm muted
Strawberry, jasmine, cocoa nib   text-sm ink
9 500 FCFA                [Add to order]  ← type-data 20px / btn-primary
```

**S8. Product card (`product-card.tsx`).**
- `article`: drop `rounded-2xl border bg-surface shadow-sm hover:shadow-md`. It becomes `group flex flex-col gap-3`.
- Image link: `rounded-2xl overflow-hidden bg-accent-soft aspect-[4/3]`, keep `card-zoom`.
- Remove the category pill. Add a lot tag at `absolute left-3 bottom-3 rounded-md bg-sand px-2 py-0.5 type-stencil text-[1.125rem] text-brand` showing `product.lotCode` (`aria-hidden`; the code is real data and repeated on the product page). Sold out: `bg-danger` tag top-right, text "Sold out", kept.
- Meta: `formatWeight(w) + (roast ? \`, ${roast.toLowerCase()} roast\` : green ? ", unroasted" : "")`.
- Notes: `<p class="text-sm">` with `cuppingNotes.join(", ")` (sentence case: capitalise the first only); visually unlabelled, `aria-label="Cupping notes"` kept on a wrapping element.
- Price `type-data text-xl`.
- Compact variant (related items): a row with an 88px image well (`rounded-xl`) and a `border-b border-border pb-4` divider instead of a card.

**S9. Lot tag (new shared `src/components/storefront/lot-tag.tsx`, server component; also used by TRACEABILITY if wanted).**
- `rounded-2xl bg-sand text-foreground p-5`. A 10px "hang hole": `before:` pseudo-element, `rounded-full bg-background`, top-left 16px; the only skeuomorphic hint.
- Header row: `type-stencil text-[1.75rem] text-cherry` `{lot.code}` + `text-sm text-muted` "Lot record".
- A `<dl class="grid grid-cols-2 gap-x-4 gap-y-3 mt-4">` of `type-label text-muted` / `type-data` pairs: Processing, Variety, Altitude, Harvested, Cupping score (`LiveLotScore`).
- "Grown by Delphine Berinyuy, Meluf". `btn btn-go` "Trace this coffee" (the QR glyph is kept).

**S10. Product page (`/shop/[slug]`).**

```
Shop / Micro-lots                         (breadcrumb; the current-name crumb is hidden below sm)
┌ image well rounded-2xl ─────────────┐
│ bag art           [GV-2026-014]     │
└─────────────────────────────────────┘
Meluf Natural Micro-lot                    type-h1
● Only 24 left                             cherry
Description                                type-lead
Tastes of strawberry, jasmine, cocoa nib   (chips kept here: rounded-lg bg-accent-soft text-accent)
9 500 FCFA                                 type-data 2rem
[− 1 +] [■ Add to order        ]           stepper + cherry
[ WhatsApp  Order this on WhatsApp ]       btn-whatsapp outline variant kept
small print
┌ LOT TAG (parchment) ────────────────┐   replaces "Coffee details" + "Where this coffee comes from"
└─────────────────────────────────────┘
Weight 250 g, Roast Light                  (non-lot details: a 2-row dl under the purchase box)
You may also like (compact rows)
```

- Order: h1, stock, description, notes, purchase, lot tag, remaining details, related. The image is `lg:sticky lg:top-6`, as now. Desktop is 2 columns `lg:grid-cols-[1.1fr_1fr] gap-14`.
- `ProductPurchase`: the panel loses its card border on mobile (`lg:` keeps a `bg-surface rounded-2xl p-5`). Remove the `→` span (line ~82).
- `StockIndicator` low state reads cherry automatically via `--warm`/`--warm-ink`; no edit needed beyond confirming.

**S11. Our story.**
- Hero: no gradient, left-aligned `max-w-3xl`, `type-h1` + `type-lead` + location as `text-sm text-muted`.
- Values row: keep (already typographic), headings `type-h2` at `text-2xl`.
- **"From farm to cup"**: a 6-step rail (the same pattern as the home steps): vertical on mobile, a 3×2 grid with a horizontal top hairline per row on `lg`. Step markers: 32px `rounded-full border-2 border-brand type-data`.
- **Farmers**: a list, not cards: `ul divide-y divide-border border-y`. Each `li` (`py-6 grid gap-4 sm:grid-cols-[auto_1fr_14rem]`):
  - a 48px initials disc `bg-sand text-brand type-data` (one colour for all; `AVATAR_COLOURS` deleted);
  - name `type-title`, "Tobin, member since 2019" `text-sm text-muted`, story;
  - right column: an **altitude bar**, a 4px `bg-border rounded-full` track for 1,600–2,000 m with a 10px cherry dot at `(alt − 1600)/400`, the label "1,780 m" `type-data text-sm`, and "1.5 ha coffee plot". This echoes the hero ridge.
  - "In lots:" links in `type-stencil text-lg text-accent min-h-11` (lot codes ≥ 18px, so the stencil is allowed).
  - Keep "Farmer names and stories on this demo are illustrative."
- CTA: full-bleed `on-dark bg-brand` band (not rounded), `btn btn-on-dark btn-lg` "Shop the harvest".

**S12. Copy edits (meaning kept):** "Shop our coffee" → "Shop the harvest" (home only). The CTA headline loses its em dash. "See all products →" → "All coffee". The example-lot link → "See the full record for GV-2026-014". The header and nav wording ("My order", "Shop", "Our story", "Trace your coffee") is unchanged.

---

### TRACEABILITY

*Owns: `src/app/trace/page.tsx`, `src/app/trace/[code]/page.tsx`, `src/app/trace/[code]/not-found.tsx`, `src/app/trace/[code]/label/page.tsx`, `src/components/trace/*` (`buttons.ts`, `cupping-score.tsx`, `icons.tsx`, `lot-products.tsx`, `lot-search.tsx`, `qr-code.tsx`, `print-button.tsx`). Mode: Read. Precision, real data, one authored moment (the ring). Depends on S1 tokens and S2 fonts.*

**T1. `buttons.ts`:** `btnPrimary = "btn btn-primary"`, `btnSecondary = "btn btn-secondary"`, `btnGo = "btn btn-go"`. Add `btnOnDark = "btn btn-on-dark"`. All are `min-h-11`; no more `rounded-md`.

**T2. `LotSearch`:**
- Add a `tone?: "light" | "dark"` prop (default `"light"`, used by the home hero). Dark tone: label `text-sand`; input `bg-surface text-foreground border-transparent`; submit `btnOnDark`; error text `text-[#F3B4A8]` (check ≥ 4.5:1 on `#33221B`, or use `text-sand` plus an icon); the wrapper gets `on-dark`.
- Input stays `font-mono text-base uppercase tracking-wide`, `rounded-lg border-field-border`. Pending label "Finding lot…" kept.

**T3. `/trace/[code]` hero (soil band).**

```
MOBILE
▓ Trace / GV-2026-014                       (breadcrumb, text-mist-on-soil; current crumb in stencil)
▓ GV-2026-014                               type-stencil 3rem text-sand  ← the sack mark replaces "VERIFIED LOT · …"
▓ Natural Arabica from Meluf                type-h1 text-white
▓ Single-farm micro-lot from Meluf…         type-lead text-white, weight 450
▓ Grown by one farmer of GREENVENTURES…     text-sm text-mist-on-soil
▓        ◯ 86.75  (ring in cherry-lift)
▓        Excellent
▓        SCA cupping score, out of 100. 80+ points is specialty grade.
▓╲___ HillsBackdrop (text-background) ___╱
```

- Visually, the stencil code sits above the h1 and is `aria-hidden`, because the h1 region already announces the lot through the breadcrumb and metadata. Add `<span class="sr-only">Lot {code}</span>` inside the h1, before the title text.
- Gauge container: drop the `rounded-3xl bg-brand-contrast/5 ring` box. The gauge sits directly on soil, `justify-self-start` on mobile and `md:justify-self-end`.
- `HillsBackdrop` stays and now resolves to mist.

**T4. `CuppingScore`:**
- Stroke `var(--cherry-lift)`, track `currentColor` at 0.18. Score number `type-data` 800 `font-stretch:80%`, `text-5xl sm:text-6xl`.
- "of 100 pts" becomes `text-xs` (12px, not 10px).
- Figcaption in sentence case: "SCA cupping score" (no uppercase/tracking). The grade pill becomes a plain `type-title text-sand` "Excellent". Then "80+ points is specialty grade" `text-sm text-mist-on-soil`.
- Delight 2: the number gets `anim-swap` keyed on the score. Keep the `@starting-style` stroke draw (600ms `ease-out`) and `motion-reduce:transition-none`.

**T5. Lot facts → "Lot record" `dl` (replaces the 6-tile floating strip).**
- No `-mt-8` overlap and no shadow. On mist, `mt-10`, `grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 border-y border-border py-5`.
- Items: Variety, Altitude, Lot weight, Origin ("Meluf, Kumbo", comma not dot). `dt` = `type-label text-muted` with the existing 16px icon in `text-accent`, sentence case; `dd` = `type-data`.
- Harvested and Processing move into the journey (T6).

**T6. "Lot journey" (new section; replaces the process card + quality card).** A real sequence on a rail:

```
Lot journey                                  type-h2
●  Harvested                                 type-title
│  29 January 2026                           type-data
│
●  Natural process                           (drop icon, accent)
│  Dried whole in the cherry on raised beds… (PROCESS_TEXT, unchanged)
│
●  Quality checked
│  Moisture 10.8%   ✓ Target 10–12% for stable storage
│  Screen size 17+  ✓ Bean size in 64ths of an inch
│  Defects 2 per 300 g ✓ Specialty grade 1 (≤ 5)
│  Tested by the cooperative's quality team before export.
│
●  Cupped: 86.75 points, Excellent           (LiveLotScore, cuppingGrade)
│
●  Farmers paid by mobile money once the lot is sold.   (existing sentence, no new data)
```

- `ol` with `relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border`. Markers: 12px `rounded-full bg-accent ring-4 ring-background`; the last marker is `bg-cherry`.
- Quality rows: `dl` with `grid-cols-[auto_1fr] gap-x-4`, values `type-data`, hints `text-sm text-muted` with the existing check icon. Not-ok states: the `item.ok` false path shows a `text-danger` warning icon plus the hint text (today it shows nothing).
- Desktop: the journey sits in a `lg:grid-cols-[1fr_22rem]` with "Meet your farmer(s)" on the right.

**T7. Farmers on trace:**
- Same list style as Our story (S11): `divide-y`, initials disc `bg-sand text-brand`, name `type-title`.
- Meta as separate spans with `gap-x-4` (village with the pin icon; altitude with the mountain icon; "1 ha"; "Member since 2021"). No dots.
- The story is wrapped in `LiveFarmerStory`.

**T8. `LotProducts`:**
- No card. Rows: 56px image (`rounded-lg`), name `type-title`, "250 g, light roast" (comma), notes as text, price `type-data`.
- "Buy →" becomes a `btn btn-primary` labelled "Add to order" if `AddToCartButton` is already used there. Otherwise a leaf link "See this coffee" (`min-h-11`, underlined). Keep the hidden/sold-out filtering exactly as it is.

**T9. QR / share section:**
- Unboxed: `border-t border-border pt-10`, `sm:grid-cols-[auto_1fr]`.
- QR `h-44 w-44 rounded-lg bg-white p-2 ring-1 ring-border`.
- Text: "This is the QR code printed on every bag from lot `<span class=type-stencil>GV-2026-014</span>`." The URL stays `font-mono text-xs` with the `<wbr>` split.
- Buttons: `btnPrimary` "Printable bag label", `btnSecondary` "Trace another lot".

**T10. `/trace` (search page):**
- Hero becomes a full-bleed soil band: `type-h1` in white, lead in white weight 450, and the `LotSearch tone="dark"` form directly on the band (no floating white card, no `shadow-lg`).
- Below, on mist: the "How it works" steps as the shared rail. Recent lots as rows: `type-stencil text-2xl text-brand` code, then "Natural process, Java" (comma) and the village names, then the score `type-data`. The rows are `border-b`, with no cards and no hover shadow.

**T11. `/trace/[code]/not-found.tsx`:** heading `type-h1`, "We couldn't find lot {code}". Explain where the code is printed ("under the QR code on the back of your bag"), with `LotSearch` and a secondary "Back to Trace". The voice is plain, with no apology.

**T12. Bag label (`/trace/[code]/label`):**
- Keep the 100 × 150 mm container-query layout and print rules.
- Brand band `#33221B` with `#EADCC0` text. The lot code in **Big Shoulders Stencil 800** (it already reads as a sack mark).
- Replace `#2f6b3f` with `#22573A`. "Cooperative Coffee · Kumbo" → "Cooperative Coffee, Kumbo". "100% Arabica · Bui Highlands" → "100% Arabica, Bui highlands", in sentence case and no longer uppercase-tracked.
- The `<title>` template stays as it is.
- Print check: the stencil font must be loaded before printing. Import `stencil` from `fonts.ts` and add `stencil.className` to the label root (do not call `Big_Shoulders_Stencil()` a second time). Then `PrintButton` waits for `document.fonts.ready` before calling `window.print()`.

---

### ORDERING & ADMIN

*Owns: `src/app/cart/page.tsx`, `src/app/order/page.tsx`, `cart-view.tsx`, `whatsapp-order-form.tsx`, `quantity-stepper.tsx`, `src/app/admin/**`, `src/components/admin/*`. Ordering is Operate with a little Persuade at the finish; admin is pure **Operate**: precision and restraint, the same tokens, no ridge, no stencil except lot codes in the lots editor, no delight beyond certain save feedback. Depends on S1/S2. Do not change `src/lib/whatsapp.ts`, message assembly, `catalog-overrides.ts`, `admin-session.ts` or the demo strips' wording.*

**O1. Cart (`/cart`, `cart-view.tsx`).**
- h1 `type-h1` "Your order list" (wording kept).
- Lines: no card per line. `ul divide-y divide-border border-y`. Each row: 72px `rounded-lg` image, name `type-title`, "250 g, light roast" (comma), the unit price `text-sm text-muted tabular`, the stepper, the line total `type-data` right-aligned, and "Remove" as a `text-sm text-danger underline min-h-11` text button.
- The "not on sale / sold out" line: "{name}: not on sale" (colon, not dot).
- Summary aside: the one card, `bg-surface rounded-2xl border border-border p-5`, `lg:sticky lg:top-6`. Totals `type-data`, tabular. CTA `btn btn-primary btn-lg w-full` **"Continue to send order"**: cherry, because it commits (was leaf).
- Empty state: `type-h2` "Your order list is empty", "Pick a coffee from this harvest, then send the order on WhatsApp.", `btn-primary` "Shop the harvest".

**O2. `QuantityStepper`:** `rounded-lg border border-field-border`, 44 × 44px buttons, value `type-data tabular w-10 text-center`, minus/plus as authored 16px SVG strokes (not glyphs), and `press` feedback.

**O3. Order page (`/order`, `whatsapp-order-form.tsx`).**

```
‹ Back to your order list        (16px chevron SVG + text, min-h-11; no "←")
Send your order                  type-h1
Your order opens in WhatsApp…    type-lead
Your details                     type-h2 (text-2xl). On mobile: no card; fields sit on mist
Full name (required)             type-label; "(required)" text-muted weight 400
[                         ]      input: bg-surface border-field-border rounded-lg min-h-12 text-base
Town or city (required)
[ e.g. Kumbo              ]
Phone (optional, …)
Delivery                         fieldset; radio tiles rounded-lg border-field-border;
( ) Within Cameroon              checked: border-accent bg-accent-soft (kept)
( ) Outside Cameroon
Notes (optional)
┌ Your order (receipt card, bg-surface) ┐
│ 2 × Meluf Natural Micro-lot  19 000 FCFA │  tabular, right-aligned
│ Subtotal / Delivery (estimate)           │
│ Estimated total            21 000 FCFA  │  type-data text-lg text-brand
│ [WhatsApp Send order on WhatsApp]        │  btn-whatsapp btn-lg (unchanged colour)
│ Add your name and town to send the order.│
│ [ Or call us: +237 6XX XXX XXX ]         │  btn-secondary
│ No payment now. We confirm…              │
└──────────────────────────────────────────┘
```

- The form card (`rounded-2xl border bg-surface p-5`) is removed below `lg`. On `lg` it is kept as a `bg-surface` panel, so the two columns balance.
- Inline errors: `errorText` pattern (`text-danger`) plus a 16px alert icon before the text (no colour-only signal). Focus moves to the first missing field, as now.
- **Delight 3 (sent screen):** as specified. It uses the `city` state already held in the form. The heading is `type-h2`. The route line is an inline SVG 240×24: a leaf dot labelled with `{city}`, a dashed soil line, a cherry dot labelled "Kumbo". Labels are `text-sm`, and long towns truncate with `max-w-[10ch] truncate` plus a `title`. Buttons: `btn-primary` "Start a new order", `btn-secondary` "Back to the shop". `clearCart` behaviour is unchanged.
- **Do not edit** the `message` string assembly, `whatsappLink`, `phoneLink`, `checkFields`, or `setSent` logic.

**O4. Admin rules (Operate).**
- Tokens: the same mist ground, Volcanic Soil header, cherry for "Save changes" (`primaryButton` resolves via `.btn-primary`), leaf for toggles on, `--field-border` for toggles off and inputs. Archivo throughout. Headings: `type-h2` max (no `type-display` or `type-h1` condensed extremes): admin h1 = `text-2xl font-bold [font-stretch:88%]`.
- **Demo strip** (`admin-shell.tsx`, line ~69): `bg-warm-ink text-white` becomes **`bg-sand text-brand`** (11.19:1), with the same wording, `text-sm font-semibold`.
- **Header:**
  - Soil band. Name in `type-title text-sand`.
  - "Staff admin · {email}" becomes "Signed in as {email}" (`text-mist-on-soil text-xs truncate`).
  - Tabs: a 3-column segmented control, `rounded-lg`, inactive `bg-white/10 text-white`, active `bg-background text-brand font-semibold`, `aria-current="page"` (keep the existing semantics), `min-h-12`.
  - "View website" and "Sign out" stay as text buttons, `min-h-11 text-sand`.
- **Product list** (`product-list.tsx`):
  - One `ul` with `bg-surface rounded-2xl border border-border divide-y divide-border`. Rows are not cards, and there are no nested bordered boxes.
  - Row: 56px thumbnail `rounded-lg`, name `type-title`, then a meta line of separate spans: price `tabular`, stock "120 in stock" (or a "Sold out" `text-danger` chip), each with `gap-x-4`; the middle dot goes. "Edit" is `btn btn-secondary min-h-11`.
  - Under that, two switches in `grid grid-cols-2 gap-2`. `Toggle` gets a `bare` variant (no border, `px-0`, still `min-h-12` and the full-row hit target) for list use. The bordered variant stays for the product form.
  - An "Edited" marker becomes `rounded-md bg-sand px-2 py-0.5 text-xs font-semibold text-brand` (was warm text).
- **Callout** "In the live version these changes are saved securely online…": `bg-accent-soft text-foreground rounded-lg p-3`, no border, with a 16px info icon in leaf.
- **Product form** (`product-form.tsx`): `inputClass` swaps `border-border` for `border-field-border`; fields stay `min-h-12`; the price input is `tabular` with an "FCFA" suffix (if it exists, keep it). Save bar on mobile: a sticky `bottom-0 bg-background/95 border-t border-border p-3` holding `primaryButton` "Save changes" + `secondaryButton` "Cancel" (keep the existing actions and labels). Saved toast: `bg-brand text-sand shadow-[var(--shadow-float)] rounded-lg`, text "Saved. Your change shows on the website in this browser." (keep the existing toast copy if it already says this). Only `anim-swap` on the label "Saving…" → "Saved".
- **Lots editor:** lot code in `type-stencil text-xl text-brand` (≥ 18px). "Natural · Java" becomes "Natural process, Java".
- **Farmers editor:** "Tobin · member since 2019" becomes "Tobin, member since 2019". Initials disc `bg-sand text-brand`.
- **Confirm dialog / danger:** unchanged tokens (`--danger`, `--danger-soft`). The reset button `btn-secondary` keeps its dashed "Demo tools" panel (the dashed border means demo).
- **Sign-in:** `type-h2` "Staff sign in", inputs `border-field-border`, `primaryButton` "Sign in". The demo note stays.
- Never: the ridge, mist bands, the ripen animation, or decorative stencil text in admin.

### Acceptance checks for all packages

These run as one batched Playwright round at 360, 390 and 1280, then at most one fix round:
- No horizontal scroll at 360.
- Every tappable element is ≥ 44px tall.
- Text pairs match the contrast table.
- The focus ring is visible on mist, surface, soil and parchment.
- `prefers-reduced-motion` shows the final states (ripened dots, full ring, drawn route line).
- No `·` in visible storefront, trace or admin copy (titles excepted). No `→`/`←` glyphs in link text. No `uppercase tracking-*` labels except the lot code.
- Fonts: two woff2 files at most per route (one on admin/cart), and no request leaves the origin.
- The WhatsApp message is byte-identical to the BEFORE build for the same cart (compare with `scratchpad/qa/wa.mjs`).
- Admin edits (name, price, photo, hidden, sold out) still show on `/shop` in the same browser.
- The demo strips are present on every page.
