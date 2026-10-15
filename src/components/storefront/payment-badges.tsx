const METHODS = [
  { label: "MTN Mobile Money", className: "bg-[#ffcc00] text-[#1a1a1a]" },
  { label: "Orange Money", className: "bg-[#ff7900] text-white" },
  { label: "Visa", className: "bg-[#1a1f71] text-white" },
  { label: "Mastercard", className: "bg-[#2b2b2b] text-white" },
];

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Accepted payment methods">
      {METHODS.map((m) => (
        <li key={m.label} className={`rounded-md px-3 py-1.5 text-xs font-bold tracking-wide shadow-sm ${m.className}`}>
          {m.label}
        </li>
      ))}
    </ul>
  );
}
