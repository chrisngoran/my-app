"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useSyncExternalStore, useTransition } from "react";
import { GoogleMark } from "@/components/staff-google-button";
import { farmerSignIn, farmerUpdateListing, farmerUpdateStock } from "@/lib/farmer-actions";
import { field, label, ListingForm, type ListingValues } from "./listing-form";

const GOOGLE_ERRORS: Record<string, string> = {
  "not-farmer": "That Google account is not on a farmer record. Sign in with your phone number and PIN, or ask the office to add your Gmail.",
  "google-failed": "Google sign-in did not finish. Try again.",
  "google-off": "Google sign-in is not available. Use your phone number and PIN.",
};
const noSubscribe = () => () => {};
const readReason = () => new URLSearchParams(window.location.search).get("signin") ?? "";

export function FarmerSignIn({ google }: { google: boolean }) {
  const [state, action, pending] = useActionState(farmerSignIn, null);
  const reason = useSyncExternalStore(noSubscribe, readReason, () => "");
  return (
    <div className="mt-6 max-w-md space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      {GOOGLE_ERRORS[reason] && (
        <p role="alert" className="text-sm font-medium text-danger">
          {GOOGLE_ERRORS[reason]}
        </p>
      )}
      <form action={action} className="space-y-4">
        <label className={label}>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" required placeholder="6 XX XX XX XX" className={`${field} tabular-nums`} />
        </label>
        <label className={label}>
          PIN
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            required
            maxLength={6}
            className={`${field} tabular-nums tracking-widest`}
          />
        </label>
        {state?.error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary btn-lg w-full">
          {pending ? "Checking…" : "Sign in"}
        </button>
      </form>
      {google && (
        <>
          <p className="text-center text-sm text-muted">or, if the office has your Gmail</p>
          <a
            href="/api/auth/google?as=farmer"
            className="press flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-field-border bg-surface px-4 font-semibold text-foreground pointer-fine:hover:bg-background"
          >
            <GoogleMark />
            Continue with Google
          </a>
        </>
      )}
      <p className="text-sm text-muted">Forgot your PIN? Ask the cooperative office for a new one.</p>
    </div>
  );
}

export interface FarmerListing extends ListingValues {
  id: number;
  status: "pending" | "approved" | "rejected" | "paused";
  note: string;
  imageSrc: string | null;
}

const STATUS = {
  pending: { text: "Waiting for approval", cls: "bg-warm/15 text-warm" },
  approved: { text: "On sale", cls: "bg-accent-soft text-accent" },
  rejected: { text: "Not approved", cls: "bg-border/60 text-muted" },
  paused: { text: "Paused by the office", cls: "bg-border/60 text-muted" },
} as const;

const small = "press inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold disabled:opacity-60";

export function FarmerListingCard({ listing }: { listing: FarmerListing }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [stock, setStock] = useState(String(listing.stock));
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const status = STATUS[listing.status];
  return (
    <li className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex gap-3">
        {listing.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- the farmer's own photo, served only to them
          <img src={listing.imageSrc} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="h-16 w-20 shrink-0 rounded-lg bg-accent-soft" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-foreground [overflow-wrap:anywhere]">{listing.name}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.text}</span>
          </div>
          <p className="text-sm text-muted">
            {listing.weightGrams} g {listing.kind === "green" ? "green" : "roasted"} · {listing.priceXaf.toLocaleString("fr-FR")} FCFA
          </p>
          {listing.status === "rejected" && listing.note && <p className="mt-1 text-sm text-foreground">The office says: {listing.note}</p>}
        </div>
      </div>
      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <ListingForm action={farmerUpdateListing} initial={listing} submitLabel="Send changes for approval" onDone={() => setEditing(false)} />
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary mt-2 w-full">
            Close
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-sm font-semibold text-foreground">
            Bags available
            <input value={stock} onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={`${field} w-28 tabular-nums`} />
          </label>
          <button
            type="button"
            disabled={pending || stock === "" || Number(stock) === listing.stock}
            onClick={() =>
              start(async () => {
                const r = await farmerUpdateStock(listing.id, Number(stock));
                setMsg(r.error ? { text: r.error } : { ok: true, text: "Saved." });
                router.refresh();
              })
            }
            className={`${small} border-accent bg-accent text-white`}
          >
            Save bags
          </button>
          <button type="button" onClick={() => setEditing(true)} className={`${small} border-border bg-surface text-foreground`}>
            Change details
          </button>
        </div>
      )}
      {msg && <p className={`mt-2 text-sm font-medium ${msg.ok ? "text-accent" : "text-danger"}`}>{msg.text}</p>}
    </li>
  );
}
