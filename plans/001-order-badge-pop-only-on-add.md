# 001 — Pop the order badge only when something is added, and drop its flicker

- **Status**: DONE
- **Commit**: bf8be15
- **Severity**: MEDIUM
- **Category**: Interruptibility (also Purpose & frequency)
- **Estimated scope**: 3 files, ~25 lines

## Problem

The count badge on the "My order" pill in the site header replays a keyframe
pop every time the order's item count goes up. The count also goes up when the
shopper taps **+** on the quantity stepper on the cart page
(`src/components/storefront/cart-view.tsx:251` renders `QuantityStepper`, whose
`onChange` calls `setQuantity`). So on the cart page every **+** tap re-keys the
badge and restarts the animation from scratch. The keyframe begins at
`opacity: 0.6`, so rapid taps make the badge flicker. On that page the pop adds
nothing: the shopper is already looking at the stepper's own number.

The pop exists to confirm "something was added to your order" from the shop and
product pages, where the badge is far from the button. It should fire only for
an add, not for a quantity edit.

```tsx
/* src/components/site-header.tsx:70-100 — current */
/** "My order" pill. The count badge pops when an item is added in this visit. */
function OrderPill({ className = "" }: { className?: string }) {
  const { count: itemCount, loaded } = useOrderableCount();
  // Derived during render (no effect): count each increase after the saved cart has loaded.
  const [seen, setSeen] = useState({ count: itemCount, loaded, bumps: 0 });
  if (seen.count !== itemCount || seen.loaded !== loaded) {
    setSeen({
      count: itemCount,
      loaded,
      bumps: seen.loaded && loaded && itemCount > seen.count ? seen.bumps + 1 : seen.bumps,
    });
  }
  ...
      <span
        key={seen.bumps}
        aria-hidden="true"
        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-1.5 text-xs font-bold text-cherry tabular-nums ${
          seen.bumps > 0 ? "anim-pop" : ""
        }`}
      >
```

```css
/* src/app/globals.css:478-483 — current */
@keyframes gv-pop {
  from {
    opacity: 0.6;
    transform: scale(0.85);
  }
}
```

## Target

- The badge pops only when `addToCart` runs: the Add to order button, and
  Undo on the cart page, which also calls `addToCart`.
- Quantity stepper changes (`setQuantity`) never pop the badge.
- The pop is a scale only, with no opacity dip:

```css
/* target */
@keyframes gv-pop {
  from {
    transform: scale(0.85);
  }
}
```

The `.anim-pop` rule itself stays as it is: `animation: gv-pop 220ms var(--ease-out);`,
with `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. The reduced-motion fallback
also stays: `.anim-pop { animation: gv-fade 150ms ease; }` inside
`@media (prefers-reduced-motion: reduce)`.

## Repo conventions to follow

- Store state lives in `src/components/store-provider.tsx`. Context fields are
  declared on `interface StoreState` (line 13) and assembled in the `useMemo`
  near line 182.
- Comments are short and explain *why*. Match the existing style, e.g.
  `/** True once the saved cart and currency have been read from localStorage. */`.

## Steps

1. **`src/components/store-provider.tsx`: add an add counter to the context.**
   1. Change the import on line 3 to include `useState`:
      `import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";`
   2. In `interface StoreState`, after `itemCount: number;`, add:
      ```ts
      /** How many times addToCart has run in this visit. The header badge pops when it changes. */
      adds: number;
      ```
   3. Inside `StoreProvider`, right after the `useSyncExternalStore` line, add:
      `const [adds, setAdds] = useState(0);`
   4. In `addToCart`, after the `if (add < 1) return;` line, add
      `setAdds((n) => n + 1);`. Keep the `useCallback` dependency array `[]`:
      `setAdds` is stable.
   5. In the `useMemo` value, add `adds,` after the `itemCount: ...` line, and
      add `adds` to that `useMemo`'s dependency array.

2. **`src/components/site-header.tsx`: key the badge on `adds`.**
   1. In `OrderPill`, delete the comment line
      `// Derived during render (no effect)...`, the `const [seen, setSeen] = useState(...)`
      line, and the whole `if (seen.count !== itemCount || seen.loaded !== loaded) { ... }`
      block.
   2. Add, after the `useOrderableCount()` line:
      `const { adds } = useStore();`
      (`useStore` is already imported from `"./store-provider"`.)
   3. On the badge `<span>`, change `key={seen.bumps}` to `key={adds}`, and
      change `seen.bumps > 0 ? "anim-pop" : ""` to `adds > 0 ? "anim-pop" : ""`.
   4. Update the doc comment above `OrderPill` to:
      `/** "My order" pill. The count badge pops each time something is added (not when a quantity is edited). */`
   5. If `useState` is no longer used anywhere in `site-header.tsx`, remove it
      from the `react` import. Run lint to check.

3. **`src/app/globals.css`: drop the opacity dip.** Replace the `@keyframes gv-pop`
   block with the target above, with the `opacity: 0.6;` line removed.

## Boundaries

- Do NOT change `.anim-pop`, its duration, its easing, or the reduced-motion block.
- Do NOT touch `QuantityStepper`, `CartView` or `AddToCartButton`.
- Do NOT persist `adds` to localStorage.
- Do NOT add dependencies.
- If the code at the cited lines differs from the excerpts (drift since bf8be15),
  STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx eslint src`, `npx tsc --noEmit -p .` and `npm run build`.
  All three must pass with no new warnings.
- **Feel check**: run `npm run build && npx next start`, then:
  - On `/shop/bui-highlands-medium-roast`, press **Add to order**. The header
    badge grows from slightly small to full size once, with no fade.
  - Go to `/cart` and tap **+** ten times quickly. The badge number updates
    and does not pop or flicker.
  - On `/cart`, press **Remove** and then **Undo**. The badge pops once.
    This is accepted, because Undo is an add.
  - In DevTools, open the Animations panel, set it to 10%, add an item, and
    confirm the badge only scales from 0.85 to 1, with opacity at 1 the whole time.
  - In the Rendering panel, emulate `prefers-reduced-motion: reduce` and add
    an item. The badge does a short fade, not a scale.
- **Done when**: stepper changes never add the `anim-pop` class to the badge,
  adds always do, and `gv-pop` contains only `transform`.
