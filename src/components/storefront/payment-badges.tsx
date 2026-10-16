/*
 * How to order and pay, shown as flat information chips (not buttons). The
 * small marks carry the operators' colours; the text stays dark on white so
 * it reads at full contrast.
 */
const METHODS = [
  { label: "MTN Mobile Money", mark: "rounded-full bg-[#ffcc00] ring-1 ring-black/15" },
  { label: "Orange Money", mark: "rounded-[3px] bg-[#ff7900]" },
  { label: "Order on WhatsApp", mark: "rounded-full bg-whatsapp" },
];

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="How to order and pay">
      {METHODS.map((m) => (
        <li
          key={m.label}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground"
        >
          <span aria-hidden="true" className={`h-3 w-3 shrink-0 ${m.mark}`} />
          {m.label}
        </li>
      ))}
    </ul>
  );
}
