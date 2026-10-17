# 002 — Make the staff dashboard's demo dot still

- **Status**: TODO
- **Commit**: bf8be15
- **Severity**: LOW
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file, ~5 lines

## Problem

Every page of the staff dashboard (`/portal/*`) has a "Demo: signed in as
Cooperative Manager" bar. A green dot in that bar pulses forever
(Tailwind `animate-ping`: a 1s scale-to-2 and fade loop, repeated endlessly).
Staff would see it all day. It is constant motion in the corner of the eye
that tells them nothing new. A "signed in" state is static and needs no
animation. The bar sits on every portal page, so this counts as
"tens of times a day", and decorative motion at that frequency should be removed.

```tsx
/* src/app/(site)/portal/layout.tsx:20-25 — current */
<span className="inline-flex items-center gap-2 font-medium">
  <span className="relative flex h-2 w-2" aria-hidden="true">
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
  </span>
  Demo: signed in as Cooperative Manager
</span>
```

## Target

A single still dot, with no wrapper and no ping layer:

```tsx
/* target */
<span className="inline-flex items-center gap-2 font-medium">
  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
  Demo: signed in as Cooperative Manager
</span>
```

## Repo conventions to follow

- Still status dots elsewhere are a plain sized, rounded span. See
  `src/components/storefront/stock-indicator.tsx`, which renders a coloured dot
  with no animation.

## Steps

1. In `src/app/(site)/portal/layout.tsx`, replace the
   `<span className="relative flex h-2 w-2" aria-hidden="true">…</span>` element,
   including both inner spans, with
   `<span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />`.

## Boundaries

- Do NOT change the bar's text, colours or layout.
- Do NOT touch any other file.
- If the code at the cited lines differs from the excerpt, STOP and report.

## Verification

- **Mechanical**: run `npx eslint src` and `npm run build`. Both must pass.
- **Feel check**: open `/portal`. The green dot sits still, left of
  "Demo: signed in as Cooperative Manager", vertically centred on the text and
  the same size as before (8px).
- **Done when**: `grep -rn "animate-ping" src` returns nothing.
