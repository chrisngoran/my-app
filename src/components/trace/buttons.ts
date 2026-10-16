/**
 * Class recipes for the traceability pages.
 *
 * Buttons are the shared `btn` / `btn-*` recipes from globals.css (44px,
 * rounded-lg, press scale, hover gated to fine pointers, reduced motion
 * handled there). Colour comes from the tokens, so these pick up the site
 * identity without trace-specific overrides.
 */

/** Cherry "commit" button: the main action on a light surface. */
export const btnPrimary = "btn btn-primary";

/** Soil outline button for the secondary action beside a primary one. */
export const btnSecondary = "btn btn-secondary";

/** Leaf "go" button: trace actions on a light surface. */
export const btnGo = "btn btn-go";

/** Parchment button for actions sitting on a Volcanic Soil band. */
export const btnOnDark = "btn btn-on-dark";

/** Underlined leaf text link, padded to a 44px tap target. */
export const textLink =
  "inline-flex min-h-11 items-center font-semibold text-accent underline decoration-1 underline-offset-[3px] hover:decoration-2";
