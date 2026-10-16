# Product

<!-- impeccable:product-schema 1 -->

> Written from the project brief and the existing codebase, without a live interview. Facts marked *(inferred)* should be confirmed with the cooperative.

## Platform

web

## Users

- **Cameroonian coffee buyers.** They usually browse on mid-range Android phones, often on slow or metered mobile data. They know WhatsApp and mobile money (MTN MoMo, Orange Money) well and expect to order by chatting or calling, not through a checkout. Prices are in FCFA.
- **Foreign specialty-coffee buyers, cafés and roasters.** They mostly use laptops or recent phones. They read the provenance, the quality record (cupping score, moisture, screen size, defects) and the lot codes before they ask about green coffee by the bag. They may switch the display currency to EUR or USD.
- **Cooperative staff.** They use their phones to keep the website up to date: product names, prices, photos, stock, visibility, lot tasting notes, cupping scores and farmer stories. They are not designers or developers. They need large tap targets, plain language and clear confirmation that a change was saved.
- **The cooperative's board** *(evaluation audience)*. The site is a demo that will be shown to them to win the contract. It has to feel trustworthy, local and finished.

## Product Purpose

Green Venture Cooperative Coffee is a smallholder Arabica cooperative in Kumbo, Bui Division, North West Cameroon. The website sells its coffee directly and makes every bag traceable to the farmers who grew it.

Success means that:
- a buyer moves from interest to a WhatsApp message or phone call with the order already written;
- a bag's QR code or lot code opens a provenance record the buyer believes;
- staff can change the catalogue from a phone without help.

## Positioning

The cooperative sells coffee from named member families on the Bui highlands (1,600–2,000 m), and each bag carries a lot code that leads to a public record: the farmers, villages, altitude, harvest date, processing method, quality record and payment by mobile money. Ordering happens through WhatsApp or phone, and buyers pay by MTN MoMo or Orange Money after the cooperative confirms. This matches how Cameroonian buyers already shop, and a generic e-commerce template cannot honestly claim the same.

## Operating Context

- **Ordering flow.** The buyer browses `/shop`, adds items to an order list (`/cart`), fills in their name, town, delivery zone and notes on `/order`, then sends a pre-written WhatsApp message or calls. There is no online payment. The cooperative confirms availability and the delivery fee, then the buyer pays by MTN MoMo or Orange Money.
- **Traceability.** Every bag has a QR code and a lot code (for example `GV-2026-014`). `/trace` lets people search for a code. `/trace/[code]` shows the provenance record. `/trace/[code]/label` is a printable 10 × 15 cm bag label.
- **Admin.** Staff sign in at `/admin`. This is a demo: any credentials work, the session is kept in `sessionStorage` and edits are kept in `localStorage` (`src/lib/catalog-overrides.ts`). Staff then edit products, lots and farmers. Their edits show on the storefront in the same browser.
- **`/portal`.** A preview of a future upgrade, out of scope for design work.
- **Display currency.** Visitors can switch the display currency (FCFA, EUR, USD). FCFA stays the currency of record.

## Capabilities and Constraints

- Built with Next.js 16.4 App Router, React 19, TypeScript and Tailwind CSS v4. This Next.js version has breaking changes, so read `node_modules/next/dist/docs/` before changing routing or data APIs.
- Do not add npm dependencies. Do motion with CSS and Tailwind only, and respect `prefers-reduced-motion`.
- Performance comes first on slow Android phones: no heavy effects, no fonts from external CDNs, no large client bundles. Fonts are currently system stacks.
- Design mobile first: no horizontal scroll at 360 px, and touch targets of at least 44 px.
- Keep all existing features, routes, the meaning of the copy, the data and the behaviour. That includes admin overrides and the exact content of the WhatsApp message.
- Terminology in use: "My order" (header), "cart" / "your list" (cart page), "Send your order" (order page), "lot", "lot code", "cupping score", "SCA", "FCFA", "MTN MoMo", "Orange Money".

## Brand Commitments

- The name is **Green Venture Cooperative Coffee**, shortened in the header to "Green Venture Coffee".
- The palette is roasted-coffee brown with a coffee-leaf green accent and a warm sun-orange.
- The voice is warm, plain and factual, and the sentences are short. It speaks as "we" (the cooperative) to "you" (the buyer) and names real places and people.
- A demo banner states that products, farmers and orders are sample data. It must stay.

## Evidence on Hand

- Sample data is in `src/lib/data.ts`: 6 farmers, 4 lots and 5 products. The farmer names and stories are marked as illustrative.
- Product images are illustrated SVG/PNG bags in `public/products/`. The cooperative has not supplied photography; do not fabricate photos of real people.
- No testimonials, press coverage or certifications exist. Do not invent any.

## Product Principles

1. **Provenance is the product.** Every surface should bring the buyer one step closer to the farmers and the lot record.
2. **Order the way Cameroon orders.** The path to WhatsApp, a phone call and mobile money is the main path, not a fallback.
3. **Light enough for a slow phone.** Each byte and each effect has to earn its place on a mid-range Android on 3G.
4. **Staff can run it alone.** Admin screens use plain words, large targets, visible save state and no surprises.
5. **Honest demo.** Sample data is labelled as such, and nothing claims more than the cooperative can stand behind.

## Accessibility & Inclusion

- Target WCAG 2.2 AA: text contrast of at least 4.5:1, at least 3:1 for large text and UI graphics, visible keyboard focus, and labelled controls.
- Touch targets of at least 44 × 44 px (phones are the main device for both buyers and staff).
- English copy that is easy to understand for readers whose first language is French or Lamnso *(inferred)*.
- Respect `prefers-reduced-motion`: reduce motion rather than remove the feedback that shows a state has changed.
