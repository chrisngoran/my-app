/*
 * The cooperative's mark: one coffee branch, two leaves and three ripe
 * cherries, drawn in two colours so it stays readable down to a 16px tab icon.
 * Decorative wherever it appears: the cooperative's name always follows it.
 *
 * `tone="light"` sits on the page (Shade Leaf and Ripe Cherry); `tone="dark"`
 * sits on Volcanic Soil (Sun-dried Parchment and Cherry on soil). The thin
 * outline on the cherries is the ground colour, so the three read as three.
 *
 * The same drawing is rasterised into src/app/icon.png and apple-icon.png.
 */
type BrandMarkProps = {
  className?: string;
  tone?: "light" | "dark";
};

const LEAF = "M0 0 C 8 -14 30 -16 42 0 C 30 16 8 14 0 0 Z";

export function BrandMark({ className, tone = "light" }: BrandMarkProps) {
  const branch = tone === "dark" ? "var(--sand)" : "var(--accent)";
  const cherry = tone === "dark" ? "var(--cherry-lift)" : "var(--cherry)";
  const ground = tone === "dark" ? "var(--brand)" : "var(--background)";

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className}>
      <path d="M 22 86 C 40 66 58 46 82 16" fill="none" stroke={branch} strokeWidth="6.5" strokeLinecap="round" />
      <path d={LEAF} fill={branch} transform="translate(60 40) rotate(-22) scale(0.9)" />
      <path d={LEAF} fill={branch} transform="translate(46 56) rotate(200) scale(0.9)" />
      <g fill={cherry} stroke={ground} strokeWidth="2">
        <circle cx="45" cy="72" r="9.5" />
        <circle cx="60" cy="66" r="9.5" />
        <circle cx="52" cy="87" r="9.5" />
      </g>
    </svg>
  );
}
