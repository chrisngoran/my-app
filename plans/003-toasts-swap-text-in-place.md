# 003 — Keep the toast on screen and swap its text when a new message replaces it

- **Status**: DONE
- **Commit**: bf8be15
- **Severity**: LOW
- **Category**: Interruptibility
- **Estimated scope**: 2 files, ~30 lines

## Problem

Both toasts are keyed by message id, so a new message unmounts the old toast
and mounts a fresh one. The old bar vanishes with no exit, and the new one
slides up again from its own height below (`.toast-in` with `@starting-style`
`translateY(100%)`). When a second message arrives while one is showing, the
bar visibly drops out and pops back up, even though only the words changed.

Where this happens:

- Cart page: removing two coffees quickly. The "Removed … Undo" bar does it.
- Admin: saving twice quickly, or saving and then resetting. The status toast does it.

```tsx
/* src/components/storefront/cart-view.tsx:137-147 — current */
{removed && (
  <div
    key={removed.id}
    className={`on-dark toast-in pointer-events-auto flex max-w-md min-w-0 items-center gap-3 rounded-lg bg-brand py-1.5 pr-1.5 pl-4 text-sm text-brand-contrast shadow-[var(--shadow-float)] ${
      removed.leaving ? "toast-out" : ""
    }`}
  >
    <p className="line-clamp-2 min-w-0 [overflow-wrap:anywhere]">
      Removed <span className="font-semibold">{removed.name}</span>
    </p>
```

```tsx
/* src/components/storefront/cart-view.tsx:187-191 — current */
function remove(product: CatalogProduct) {
  const quantity = cart.find((i) => i.slug === product.slug)?.quantity ?? 1;
  removeFromCart(product.slug);
  setRemoved({ slug: product.slug, name: product.name, quantity, id: ++removals.current });
}
```

```tsx
/* src/components/admin/ui.tsx:179-206 — current */
const show = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
  setMessage({ text, tone, id: Date.now() });
}, []);
...
{message && (
  <p
    key={message.id}
    className={`toast-in pointer-events-auto flex max-w-md min-w-0 items-start gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-[var(--shadow-float)] [overflow-wrap:anywhere] ${
      message.tone === "error" ? "bg-danger text-white" : "on-dark bg-brand text-sand"
    } ${message.leaving ? "toast-out" : ""}`}
  >
    {message.tone === "error" ? <AlertMark /> : <CheckMark className="mt-0.5 h-4 w-4" />}
    <span>{message.text}</span>
  </p>
)}
```

## Target

- The toast element stays mounted for as long as there is a message. It slides
  in only when it first appears, after there was no toast.
- When a new message replaces a visible one, only the inner content re-keys,
  and it uses the existing `.anim-swap` class. That class is
  `animation: gv-rise 180ms var(--ease-out)`, where `gv-rise` goes from
  `opacity: 0; transform: translateY(4px)` and
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Under reduced motion it already
  falls back to `gv-fade 150ms ease`.
- A new message can arrive while the old one is leaving (`.toast-out` is on).
  Removing the class lets the CSS transition retarget the bar back to rest from
  wherever it is. It does not swap the text, because the bar is already moving.
- The first message of a showing never gets `.anim-swap`. The bar's own slide
  is the cue, and adding a second motion would double it up.

## Repo conventions to follow

- `.anim-swap` is the repo's "a label that just swapped; re-key to replay"
  recipe (`src/app/globals.css`, `.anim-swap`). The exemplar is
  `src/components/storefront/add-to-cart-button.tsx:56-66`, which keys the
  shown label and adds `anim-swap`.
- Toast exit timing constants stay as they are: `UNDO_EXIT_MS = 160` and
  `TOAST_EXIT_MS = 160`. They match `--dur-exit`.

## Steps

1. **`src/components/storefront/cart-view.tsx`**
   1. In `interface Removed`, add after `leaving?: boolean;`:
      ```ts
      /** Replaced a removal that was still showing, so only the text swaps. */
      swapped?: boolean;
      ```
   2. In `UndoToast`, delete `key={removed.id}` from the outer `<div>`.
   3. Still in `UndoToast`, change the `<p className="line-clamp-2 min-w-0 [overflow-wrap:anywhere]">`
      opening tag to:
      ```tsx
      <p
        key={removed.id}
        className={`line-clamp-2 min-w-0 [overflow-wrap:anywhere] ${removed.swapped ? "anim-swap" : ""}`}
      >
      ```
      Leave the Undo `<button>` as it is. It does not re-key.
   4. In `remove()`, replace the `setRemoved({...})` line with:
      ```ts
      setRemoved((r) => ({
        slug: product.slug,
        name: product.name,
        quantity,
        id: ++removals.current,
        swapped: r !== null && !r.leaving,
      }));
      ```

2. **`src/components/admin/ui.tsx`**
   1. Change the `useState` type in `useToast` to
      `useState<(ToastMessage & { id: number; leaving?: boolean; swapped?: boolean }) | null>(null)`.
   2. Change `show` to:
      ```ts
      const show = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
        // A message that replaces one still showing swaps its text in place; the bar does not re-enter.
        setMessage((m) => ({ text, tone, id: Date.now(), swapped: m !== null && !m.leaving }));
      }, []);
      ```
   3. In the rendered `<p>`, delete `key={message.id}`.
   4. Replace the `<p>`'s two children (the icon ternary and
      `<span>{message.text}</span>`) with one keyed wrapper:
      ```tsx
      <span key={message.id} className={`flex min-w-0 items-start gap-2 ${message.swapped ? "anim-swap" : ""}`}>
        {message.tone === "error" ? <AlertMark /> : <CheckMark className="mt-0.5 h-4 w-4" />}
        <span>{message.text}</span>
      </span>
      ```

## Boundaries

- Do NOT edit `globals.css`. `.toast-in`, `.toast-out` and `.anim-swap` stay as they are.
- Do NOT change toast timeouts, positions, colours, or the Undo behaviour.
  Undo still restores only the most recent removal.
- Do NOT touch any other component.
- If the code at the cited lines differs from the excerpts, STOP and report.

## Verification

- **Mechanical**: run `npx eslint src`, `npx tsc --noEmit -p .` and `npm run build`.
  All three must pass.
- **Feel check**: run `npm run build && npx next start`.
  - Put two or three coffees in the order. On `/cart`, press **Remove** on one.
    The bar slides up once.
  - Within 6 seconds, press **Remove** on another. The bar stays put and only
    the words "Removed …" change, rising 4px as they fade in.
  - Wait for the bar to start leaving, then remove another quickly. The bar
    reverses back up smoothly, with no jump and no restart from below.
  - Admin: sign in at `/admin` with any email and password, open a product,
    and press Save twice quickly. The toast does not drop and re-enter. Its
    text and icon swap in place.
  - In the DevTools Animations panel at 10%, confirm that only the text moves
    on a swap and the bar's `transform` stays at none.
  - With the Rendering panel's `prefers-reduced-motion: reduce`, the swap is a
    150ms fade with no movement.
- **Done when**: neither toast container carries a `key` prop, and replacing a
  visible message never re-runs the `.toast-in` entrance.
