import Link from "next/link";

export default function FarmerNotFound() {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <h1 className="font-serif text-2xl font-bold text-brand">Farmer not found</h1>
      <p className="mt-2 text-sm text-muted">There is no member with that ID in the register.</p>
      <Link href="/portal/farmers" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast">
        Back to farmers
      </Link>
    </div>
  );
}
