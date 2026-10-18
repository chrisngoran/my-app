/** "Amina Test" → "Amina T."; no name → "Verified buyer". Only first names show publicly. */
export function reviewerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Verified buyer";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** Five stars filled to `value` (halves rounded to the nearest star for clarity). Read out as "4.5 out of 5 stars". */
export function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  const filled = Math.round(value);
  return (
    <span role="img" aria-label={`${value.toFixed(1).replace(/\.0$/, "")} out of 5 stars`} className="inline-flex shrink-0 gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} aria-hidden="true" viewBox="0 0 20 20" className={`${className} ${i <= filled ? "text-[#c98500]" : "text-border"}`} fill="currentColor">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" />
        </svg>
      ))}
    </span>
  );
}
