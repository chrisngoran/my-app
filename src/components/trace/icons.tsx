/** Small decorative inline icons used across the traceability pages. */
type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MountainIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="m3 20 6.5-11 4 6.5L16 12l5 8z" />
      <path d="m8 11.5 1.5 1 1.5-1" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

export function DropIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  );
}

export function BeanIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <ellipse cx="12" cy="12" rx="6.5" ry="9" transform="rotate(30 12 12)" />
      <path d="M9 5.5c3 3 0 7 3 9.5s3 3.5 3 3.5" />
    </svg>
  );
}

export function LeafIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15" />
      <path d="M5 19c3-4 6-7 10-9" />
    </svg>
  );
}

export function ScaleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 4v16M6 20h12M5 8h14M5 8l-2.5 6a2.8 2.8 0 0 0 5 0zM19 8l-2.5 6a2.8 2.8 0 0 0 5 0z" />
    </svg>
  );
}

export function PinIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function QrIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2.5v2.5M20.5 14.5v0M14.5 20.5h6v-3" />
    </svg>
  );
}

export function CupIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6z" />
      <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3" />
    </svg>
  );
}

/**
 * Stylised hills used as a decorative band at the foot of the brown heroes.
 * The far ridges are light tints of the current colour over the brand brown;
 * the nearest ridge is solid page background, so the hero flows into the page
 * instead of ending in a hard, muddy seam.
 */
export function HillsBackdrop({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true" className={className}>
      <path d="M0 120 C 150 50, 300 50, 450 105 S 750 30, 900 85 S 1100 65, 1200 50 V200 H0z" fill="currentColor" opacity="0.08" />
      <path d="M0 150 C 200 90, 350 110, 550 140 S 850 80, 1000 120 S 1150 130, 1200 110 V200 H0z" fill="currentColor" opacity="0.14" />
      <path d="M0 182 C 200 150, 380 160, 600 176 S 950 148, 1200 168 V200 H0z" fill="var(--background)" />
    </svg>
  );
}
