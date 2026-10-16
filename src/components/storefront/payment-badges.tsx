const METHODS = [
  { label: "MTN Mobile Money", className: "bg-[#ffcc00] text-[#1a1a1a]" },
  { label: "Orange Money", className: "bg-[#ff7900] text-white" },
  { label: "WhatsApp orders", className: "bg-[#1f8a4c] text-white" },
];

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="How to order and pay">
      {METHODS.map((m) => (
        <li key={m.label} className={`rounded-md px-3 py-1.5 text-xs font-bold tracking-wide shadow-sm ${m.className}`}>
          {m.label}
        </li>
      ))}
    </ul>
  );
}
