# Design System — Finance Tracker

## Product Context
- **What this is:** A finance tracker for logging income/expenses, viewing cash flow and category breakdowns, and getting AI-assisted entry and insights.
- **Who it's for:** Both individuals and organizations (e.g. savings groups / njangi) tracking shared or personal finances.
- **Space/industry:** Personal finance / fintech, FCFA currency, Central/West African context.
- **Project type:** Web app (React + Vite + Supabase).
- **Memorable thing:** Should feel modern & premium — a precision financial instrument, not a budgeting spreadsheet.

## Aesthetic Direction
- **Direction:** Refined instrument-panel dark.
- **Decoration level:** Intentional — a soft gold gradient glow behind the hero balance figure; otherwise type and color carry the design.
- **Mood:** Considered and expensive, but still fast and legible for a data-dense finance tool.
- **Reference sites:** Copilot Money (copilot.money), Mercury (mercury.com), Flutterwave (flutterwave.com).

## Typography
- **Display/Hero:** Fraunces — warm serif for the hero balance and section headings; deliberate break from the sans-everywhere fintech norm.
- **Body:** DM Sans — clean, legible at small sizes, for labels and paragraphs.
- **UI/Labels:** DM Sans (same as body).
- **Data/Tables/Amounts:** IBM Plex Mono, tabular numerals — every money amount uses this for a precision-instrument feel.
- **Code:** IBM Plex Mono.
- **Loading:** Google Fonts — `Fraunces:opsz,wght@9..144,300..900`, `DM+Sans:wght@400;500;600;700`, `IBM+Plex+Mono:wght@400;500;600`.
- **Scale:** hero 52px / h1 22px / h2 13px (uppercase, muted) / body 14-15px / data 22-24px / table 13px / micro 11-12px.

## Color
- **Approach:** Balanced — near-black neutrals + two semantic colors (income/expense) + one signature accent.
- **Primary accent:** `#d4a24c` (warm gold) — buttons, active states, focus rings. Chosen because almost nobody else in this category uses gold; blue/purple are the default and blend in.
- **Income:** `#2fbf83` (emerald).
- **Expense:** `#ea6570` (coral-red) — replaces the old blue-expense convention with the universal red=expense signal.
- **Neutrals (dark, default):** page `#0a0a0c`, surface `#131316`, surface-2 `#1c1c20`, ink `#f5f3ee`, ink-2 `#b8b4ab`, muted `#7d7972`, border `rgba(255,255,255,0.08)`.
- **Neutrals (light):** page `#f7f5f0`, surface `#ffffff`, surface-2 `#f0eee7`, ink `#17140f`, ink-2 `#56514a`, muted `#928c81`, border `rgba(23,20,15,0.09)`.
- **Semantic:** success = income green, error = expense red, info/accent = gold.
- **Dark mode:** Dark is the default theme (not just a `prefers-color-scheme` fallback). Light mode is fully supported via a manual toggle, with accent/income/expense hues adjusted for contrast on a light surface (see light neutrals above).

## Spacing
- **Base unit:** 8px.
- **Density:** Comfortable-to-spacious on desktop; compact on mobile (existing `@media (max-width: 640px)` and `@media (max-width: 860px)` rules stay as-is).
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout
- **Approach:** Grid-disciplined, close to the existing card structure.
- **Grid:** Charts 3fr/2fr side-by-side above 860px, single column below. Stat row 2 columns (income/expense) below a full-width hero balance card.
- **Max content width:** 980px (unchanged from current `.app`).
- **Border radius:** sm 6px, md 12px, lg 20px (hero balance card, login card, device-level containers), full 9999px (pills/filter buttons).
- **Hero balance:** The balance becomes a poster-style hero statement (own card, large serif figure, gold radial glow) instead of one of three equal stat tiles. Income/expense move to a secondary 2-column stat row below it.

## Motion
- **Approach:** Intentional — subtle, not showy. This is still a data app that needs to feel fast.
- **Specifics:** numbers count up on load, chart lines draw in, cards lift slightly on hover (`translateY(-1px)` + shadow).
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out).
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms).

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-22 | Initial design system created | Created via `/design-consultation` based on product context (universal finance tracker, FCFA, individuals + organizations) and visual research on Copilot Money, Mercury, and Flutterwave. User confirmed "modern & premium" as the target feeling and approved the HTML preview (dark-first, Fraunces + DM Sans + IBM Plex Mono, gold signature accent) without changes. |
