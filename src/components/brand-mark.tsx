/*
 * The cooperative's logo: a coffee bean with a leaf sprouting from it, and
 * the name drawn in lowercase as "greenventures". The bean reads as coffee at
 * any size (down to a 16px tab icon); the leaf says "green". The registered
 * name, GREENVENTURES Cooperative Society Ltd, is still used in full on the
 * footer, receipts and legal pages; the lowercase is only the logo's drawing.
 *
 * `tone="light"` sits on the page (Shade Leaf bean, Sprout leaf);
 * `tone="dark"` sits on Volcanic Soil (Parchment bean, Sprout-on-soil leaf).
 * The crease is cut in the ground colour so the bean reads as a bean.
 *
 * The same drawing is rasterised into src/app/icon.png, apple-icon.png and
 * the link-preview images in public/share.
 */
type Tone = "light" | "dark";

const LEAF = "M0 0 C 7 -11 26 -12 36 0 C 26 12 7 11 0 0 Z";

export function BrandMark({ className, tone = "light" }: { className?: string; tone?: Tone }) {
  const bean = tone === "dark" ? "var(--sand)" : "var(--accent)";
  const leaf = tone === "dark" ? "var(--sprout-on-soil)" : "var(--sprout)";
  const ground = tone === "dark" ? "var(--brand)" : "var(--background)";

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <g transform="translate(9 21.3) scale(0.82)">
        <g transform="rotate(-32 50 50)">
          <path d={LEAF} fill={leaf} transform="translate(50 9) rotate(-62)" />
          <ellipse cx="50" cy="50" rx="31" ry="44" fill={bean} />
          <path d="M 50 12 C 68 32 32 66 50 88" fill="none" stroke={ground} strokeWidth="7" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/** "greenventures": "green" in the leaf colour, "ventures" in the soil colour. Decorative text; pair with an accessible name. */
export function BrandWordmark({ className, tone = "light" }: { className?: string; tone?: Tone }) {
  const first = tone === "dark" ? "text-sprout-on-soil" : "text-accent";
  const rest = tone === "dark" ? "text-sand" : "text-brand";
  return (
    <span aria-hidden="true" className={`font-black tracking-tight [font-stretch:92%] ${className ?? ""}`}>
      <span className={first}>green</span>
      <span className={rest}>ventures</span>
    </span>
  );
}
