"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { Price } from "@/components/price";
import {
  createFarmer,
  decideListing,
  type FormState,
  resetFarmerPin,
  saveCommission,
  setFarmerEnabled,
  staffAddListing,
  staffUpdateListing,
} from "@/lib/market-actions";
import { field, label, ListingForm, type ListingValues } from "./listing-form";

const small = "press inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold disabled:opacity-60";

function Feedback({ state }: { state: FormState }) {
  if (state?.error)
    return (
      <p role="alert" className="text-sm font-medium text-danger">
        {state.error}
      </p>
    );
  if (state?.ok)
    return (
      <p role="status" className="text-sm font-medium text-accent">
        {state.ok}
      </p>
    );
  return null;
}

/** Runs a staff step, shows any error, then reloads the page's data. */
function useStep() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (step: () => Promise<{ error?: string }>) =>
    start(async () => {
      const r = await step();
      setError(r.error ?? null);
      router.refresh();
    });
  return { pending, error, run };
}

export function CommissionForm({ pct }: { pct: number }) {
  const [state, action, pending] = useActionState(saveCommission, null);
  return (
    <form action={action} className="space-y-3">
      <label className={label}>
        Cooperative&apos;s share of each farmer sale (%)
        <input name="pct" inputMode="decimal" defaultValue={pct} className={`${field} max-w-32 tabular-nums`} />
      </label>
      <p className="text-sm text-muted">The farmer gets the rest. A change applies to new orders; past orders keep the share they were sold at.</p>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn btn-secondary">
        {pending ? "Saving…" : "Save share"}
      </button>
    </form>
  );
}

export function AddFarmerForm() {
  const [state, action, pending] = useActionState(createFarmer, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
        <label className={label}>
          Full name
          <input name="name" required maxLength={80} className={field} />
        </label>
        <label className={label}>
          Village
          <input name="village" maxLength={80} placeholder="e.g. Shisong" className={field} />
        </label>
        <label className={label}>
          Phone number
          <input name="phone" type="tel" required placeholder="6 XX XX XX XX" className={`${field} tabular-nums`} />
        </label>
        <label className={label}>
          PIN for signing in (4–6 digits)
          <input name="pin" inputMode="numeric" required pattern="\d{4,6}" maxLength={6} className={`${field} tabular-nums`} />
        </label>
      </div>
      <label className={label}>
        Gmail <span className="font-normal text-muted">(optional, lets them use Continue with Google)</span>
        <input name="email" type="email" className={field} />
      </label>
      <label className={label}>
        Their story <span className="font-normal text-muted">(optional, shown on their shop page)</span>
        <textarea name="story" rows={3} maxLength={1500} className={`${field} min-h-24`} />
      </label>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Adding…" : "Add farmer"}
      </button>
    </form>
  );
}

export function FarmerControls({ id, active }: { id: number; active: boolean }) {
  const { pending, error, run } = useStep();
  const [pin, setPin] = useState("");
  const [asking, setAsking] = useState(false);
  return (
    <div className="mt-3 space-y-2">
      {asking ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm font-semibold text-foreground">
            New PIN
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              className={`${field} w-32 tabular-nums`}
            />
          </label>
          <button
            type="button"
            disabled={pending || pin.length < 4}
            onClick={() =>
              run(async () => {
                const r = await resetFarmerPin(id, pin);
                if (!r.error) {
                  setAsking(false);
                  setPin("");
                }
                return r;
              })
            }
            className={`${small} border-accent bg-accent text-white`}
          >
            Save PIN
          </button>
          <button type="button" onClick={() => setAsking(false)} className={`${small} border-border bg-surface`}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAsking(true)} className={`${small} border-border bg-surface text-foreground`}>
            Reset PIN
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => setFarmerEnabled(id, !active))}
            className={`${small} border-border bg-surface ${active ? "text-danger" : "text-accent"}`}
          >
            {active ? "Stop selling (hides their coffee)" : "Let them sell again"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

export function StaffAddListing({ farmers }: { farmers: { id: number; name: string }[] }) {
  if (farmers.length === 0) return <p className="text-sm text-muted">Add a farmer first.</p>;
  return (
    <ListingForm action={staffAddListing} submitLabel="Put on sale">
      <label className={label}>
        Farmer
        <select name="farmerId" required className={field} defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          {farmers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </label>
    </ListingForm>
  );
}

export interface StaffListing extends ListingValues {
  id: number;
  farmer: string;
  status: "pending" | "approved" | "rejected" | "paused";
  imageSrc: string | null;
  note: string;
}

const STATUS_TEXT = { pending: "Waiting for approval", approved: "On sale", rejected: "Not approved", paused: "Paused" } as const;
const STATUS_CLASS = {
  pending: "bg-warm/15 text-warm",
  approved: "bg-accent-soft text-accent",
  rejected: "bg-border/60 text-muted",
  paused: "bg-border/60 text-muted",
} as const;

export function ListingCard({ listing }: { listing: StaffListing }) {
  const { pending, error, run } = useStep();
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <li className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex gap-3">
        {listing.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- staff-only thumbnail, served from the database
          <img src={listing.imageSrc} alt="" className="h-16 w-20 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="h-16 w-20 shrink-0 rounded-lg bg-accent-soft" aria-hidden="true" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-semibold text-foreground [overflow-wrap:anywhere]">{listing.name}</p>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[listing.status]}`}>{STATUS_TEXT[listing.status]}</span>
          </div>
          <p className="text-sm text-muted">
            {listing.farmer} · {listing.weightGrams} g {listing.kind === "green" ? "green" : "roasted"} · <Price xaf={listing.priceXaf} /> · {listing.stock}{" "}
            bags
          </p>
          {listing.status === "rejected" && listing.note && <p className="mt-1 text-sm text-muted">Reason given: {listing.note}</p>}
        </div>
      </div>
      {listing.description && !editing && <p className="mt-2 text-sm whitespace-pre-line text-foreground [overflow-wrap:anywhere]">{listing.description}</p>}

      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <ListingForm action={staffUpdateListing} initial={listing} submitLabel="Save changes" onDone={() => setEditing(false)} />
          <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary mt-2 w-full">
            Close
          </button>
        </div>
      ) : rejecting ? (
        <div className="mt-3 space-y-2">
          <label className={label}>
            Reason the farmer will see <span className="font-normal text-muted">(optional)</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} placeholder="e.g. Please add a clearer photo" className={field} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => decideListing(listing.id, "rejected", reason))}
              className={`${small} border-danger bg-danger text-white`}
            >
              Do not approve
            </button>
            <button type="button" onClick={() => setRejecting(false)} className={`${small} border-border bg-surface`}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {(listing.status === "pending" || listing.status === "rejected") && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => decideListing(listing.id, "approved"))}
              className={`${small} border-accent bg-accent text-white`}
            >
              Approve and put on sale
            </button>
          )}
          {listing.status === "pending" && (
            <button type="button" onClick={() => setRejecting(true)} className={`${small} border-border bg-surface text-danger`}>
              Do not approve…
            </button>
          )}
          {listing.status === "approved" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => decideListing(listing.id, "paused"))}
              className={`${small} border-border bg-surface text-foreground`}
            >
              Pause
            </button>
          )}
          {listing.status === "paused" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => decideListing(listing.id, "approved"))}
              className={`${small} border-accent bg-accent text-white`}
            >
              Put back on sale
            </button>
          )}
          <button type="button" onClick={() => setEditing(true)} className={`${small} border-border bg-surface text-foreground`}>
            Edit
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </li>
  );
}
