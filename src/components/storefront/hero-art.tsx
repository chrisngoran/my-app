/**
 * Decorative illustration of the Bui highlands: layered hills, coffee shrubs and a rising sun.
 * It fills (and crops to) whatever box it is given, so a short band on phones keeps the hills.
 */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 450"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6e2c6" />
          <stop offset="1" stopColor="#fbf8f4" />
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#hero-sky)" />
      <circle cx="430" cy="140" r="58" fill="#c27a34" opacity="0.85" />
      <path d="M0 250 L90 170 L170 220 L270 130 L370 210 L470 150 L600 230 L600 450 L0 450 Z" fill="#2f6b3f" opacity="0.35" />
      <path d="M0 300 L120 240 L240 285 L360 225 L480 280 L600 250 L600 450 L0 450 Z" fill="#2f6b3f" opacity="0.6" />
      <path d="M0 350 C120 310 220 340 320 320 C430 298 520 330 600 315 L600 450 L0 450 Z" fill="#245432" />
      {[
        [70, 360],
        [150, 345],
        [235, 352],
        [320, 338],
        [410, 340],
        [500, 345],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-3" y="0" width="6" height="34" fill="#4a2c20" />
          <ellipse cx="0" cy="-4" rx="26" ry="20" fill="#2f6b3f" />
          <ellipse cx="-12" cy="-12" rx="14" ry="10" fill="#3d8a52" />
          <circle cx="8" cy="0" r="4" fill="#b0413e" />
          <circle cx="15" cy="-6" r="4" fill="#b0413e" />
          <circle cx="-6" cy="4" r="4" fill="#c27a34" />
        </g>
      ))}
      <path d="M0 400 C150 385 300 410 600 392 L600 450 L0 450 Z" fill="#4a2c20" />
      <text className="max-lg:hidden" x="40" y="70" fontFamily="Georgia, serif" fontSize="18" fill="#4a2c20" opacity="0.8">
        Bui highlands · 1,600–2,000 m
      </text>
    </svg>
  );
}
