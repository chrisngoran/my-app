/**
 * Class recipes for the traceability pages.
 *
 * Buttons are the shared `btn` / `btn-*` recipes from globals.css (44px,
 * rounded-lg, 0.97 press scale, hover gated to fine pointers, reduced-motion
 * handled there). Only the trace-specific card and arrow recipes live here.
 */

/** Brown brand button: the main action on a light surface. */
export const btnPrimary = "btn btn-primary text-sm";

/** Bordered surface button for the secondary action beside a primary one. */
export const btnSecondary = "btn btn-secondary text-sm";

/** Green "go" button for the lot search. */
export const btnGo = "btn btn-go text-sm";

/** Shared arrow nudge for linked cards: moves 3px on hover, hover-capable devices only. */
export const arrowNudge =
  "h-4 w-4 transition-transform duration-(--dur-ui) ease-out group-hover:translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0";

/** Linked card surface: border and shadow transition only (no `transition: all`). */
export const linkedCard = "group transition-[border-color,box-shadow] duration-200 ease-out hover:border-accent hover:shadow-md";
