"use client";

import { useActionState } from "react";
import { signInStaff } from "@/lib/staff-actions";

export function StaffLogin({ passwordSet, next, note }: { passwordSet: boolean; next: string; note: string }) {
  const [state, action, pending] = useActionState(signInStaff, null);
  if (!passwordSet) {
    return (
      <div className="max-w-md rounded-xl border border-border bg-surface p-5 text-sm shadow-sm">
        <p className="font-semibold text-foreground">Staff password not set up yet</p>
        <p className="mt-1 text-muted">
          Real orders are recorded, but no one can see or manage them until a staff password of at least 8 characters is added as
          STAFF_PASSWORD in the site&apos;s Vercel settings.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="max-w-md rounded-xl border border-border bg-surface p-5 shadow-sm">
      <p className="font-semibold text-foreground">Staff sign-in</p>
      <p className="mt-1 text-sm text-muted">{note}</p>
      <input type="hidden" name="next" value={next} />
      <label className="mt-4 block text-sm font-semibold text-foreground">
        Staff password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-invalid={!!state?.error}
          aria-describedby={state?.error ? "staff-login-error" : undefined}
          className="mt-1.5 block min-h-12 w-full rounded-lg border border-field-border bg-surface px-3 py-2 text-base font-normal text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent aria-[invalid=true]:border-danger"
        />
      </label>
      {state?.error && (
        <p id="staff-login-error" role="alert" className="mt-2 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary mt-4 w-full">
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
