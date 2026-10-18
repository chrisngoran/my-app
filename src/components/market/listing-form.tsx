"use client";

import { useActionState, useEffect, useState } from "react";
import { resizeImage } from "@/components/admin/resize-image";
import type { FormState } from "@/lib/market-actions";

export const field =
  "mt-1.5 block min-h-12 w-full rounded-lg border border-field-border bg-surface px-3 py-2 text-base font-normal text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent";
export const label = "block text-sm font-semibold text-foreground";

export interface ListingValues {
  id?: number;
  name: string;
  kind: "roasted" | "green";
  weightGrams: number;
  priceXaf: number;
  stock: number;
  description: string;
  image?: string;
}

/**
 * The coffee form used by staff and by farmers: name, roasted or green,
 * weight, price, bags available, description and a photo. The photo is made
 * small in the phone before it is sent, so it uploads quickly on mobile data.
 */
export function ListingForm({
  action,
  initial,
  submitLabel,
  children,
  onDone,
}: {
  action: (prev: FormState, f: FormData) => Promise<FormState>;
  initial?: ListingValues;
  submitLabel: string;
  /** Extra fields above the form (e.g. which farmer). */
  children?: React.ReactNode;
  onDone?: () => void;
}) {
  const [photo, setPhoto] = useState<string>("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  // React clears the form's fields after a successful save; the photo preview is cleared here with it.
  const [state, run, pending] = useActionState(async (prev: FormState, f: FormData) => {
    const result = await action(prev, f);
    if (result?.ok && !initial) setPhoto("");
    return result;
  }, null);
  useEffect(() => {
    if (state?.ok) onDone?.();
  }, [state, onDone]);

  return (
    <form action={run} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="image" value={photo} />
      {children}
      <label className={label}>
        Name of the coffee
        <input name="name" required maxLength={80} defaultValue={initial?.name} placeholder="e.g. Shisong washed Arabica" className={field} />
      </label>
      <fieldset>
        <legend className={label}>Type</legend>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {(
            [
              ["roasted", "Roasted"],
              ["green", "Green (unroasted)"],
            ] as const
          ).map(([v, l]) => (
            <label
              key={v}
              className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-field-border bg-surface px-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
            >
              <input type="radio" name="kind" value={v} defaultChecked={(initial?.kind ?? "roasted") === v} />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3">
        <label className={label}>
          Weight (g)
          <input name="weightGrams" inputMode="numeric" required defaultValue={initial?.weightGrams ?? 250} className={`${field} tabular-nums`} />
        </label>
        <label className={label}>
          Price (FCFA)
          <input name="priceXaf" inputMode="numeric" required defaultValue={initial?.priceXaf} className={`${field} tabular-nums`} />
        </label>
        <label className={label}>
          Bags available
          <input name="stock" inputMode="numeric" required defaultValue={initial?.stock ?? 10} className={`${field} tabular-nums`} />
        </label>
      </div>
      <label className={label}>
        Description <span className="font-normal text-muted">(optional)</span>
        <textarea
          name="description"
          rows={3}
          maxLength={1500}
          defaultValue={initial?.description}
          placeholder="Where it grew, how it was processed, how it tastes"
          className={`${field} min-h-24`}
        />
      </label>
      <label className={label}>
        Photo <span className="font-normal text-muted">{initial ? "(choose one to replace the current photo)" : "(optional)"}</span>
        <input
          type="file"
          accept="image/*"
          className="mt-1.5 block w-full text-sm"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPhotoError(null);
            try {
              setPhoto(await resizeImage(file, 900, 0.8));
            } catch (err) {
              setPhotoError(err instanceof Error ? err.message : "This photo could not be used.");
            }
          }}
        />
      </label>
      {/* eslint-disable-next-line @next/next/no-img-element -- a preview of a photo that only exists in this browser */}
      {photo && <img src={photo} alt="Preview of the new photo" className="aspect-[4/3] w-40 rounded-lg object-cover" />}
      {photoError && <p className="text-sm font-medium text-danger">{photoError}</p>}
      {state?.error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-sm font-medium text-accent">
          {state.ok}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
