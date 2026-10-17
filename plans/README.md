# Animation plans

Written by the `improve-animations` audit at commit `bf8be15`. Each plan can be
handed to any agent as is. The plans touch different files and do not depend
on each other, so any order works.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Pop the order badge only when something is added](001-order-badge-pop-only-on-add.md) | MEDIUM | TODO |
| 002 | [Make the staff dashboard's demo dot still](002-still-portal-demo-dot.md) | LOW | TODO |
| 003 | [Swap toast text in place](003-toasts-swap-text-in-place.md) | LOW | TODO |

## Recommended order

1. **001**: the only fix a shopper will notice.
2. **003**: the cart Undo bar and the admin toasts.
3. **002**: a one-line change.

## Not planned (by design)

- The shop filter grid enters all at once, with no stagger. Filtering happens
  often, so a stagger would slow it down.
- The 600ms taste-score bar draw and the 400ms "order sent" reveal. Both are
  rare, explanatory moments, and a longer duration is allowed for them.
- The "Read all the notes" expand/collapse is an optional addition, not a fix.
  Ask for a plan if you want it.
