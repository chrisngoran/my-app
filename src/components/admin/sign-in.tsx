"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { signIn, signOut, useAdminSession } from "@/lib/admin-session";
import { cooperative } from "@/lib/data";
import { AlertMark, ChevronLeftMark, errorText, InfoMark, inputClass, labelClass, primaryButton, secondaryButton } from "./ui";

/** True when this browser lets the page keep the sign-in for the tab (private modes and strict settings can block it). */
let storageWorks: boolean | null = null;
function probeSessionStorage() {
  if (storageWorks === null) {
    try {
      const key = "gv-admin-probe";
      window.sessionStorage.setItem(key, "1");
      window.sessionStorage.removeItem(key);
      storageWorks = true;
    } catch {
      storageWorks = false;
    }
  }
  return storageWorks;
}
const noSubscribe = () => () => {};

export function AdminSignIn() {
  const { email: signedInAs, loaded } = useAdminSession();
  const canKeepSession = useSyncExternalStore(noSubscribe, probeSessionStorage, () => true);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <p className="bg-sand px-4 py-2 text-center text-sm font-semibold text-brand">
        Demo admin — changes are saved only in this browser
      </p>
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <p className="type-title text-brand">{cooperative.name}</p>
        <h1 className="type-h2 mt-1 text-brand">Staff sign in</h1>
        <p className="mt-2 text-muted">Sign in to update products, prices, photos and stock on the website.</p>

        <p className="mt-5 flex items-start gap-2 rounded-lg bg-accent-soft p-3 text-sm font-semibold text-accent">
          <InfoMark />
          <span>Demo: any email and password work</span>
        </p>

        {!canKeepSession && (
          <p role="status" className="mt-3 flex items-start gap-2 rounded-lg bg-danger-soft p-3 text-sm font-medium text-danger">
            <AlertMark />
            <span>Your browser blocks storage, so you will need to sign in again if you reload or open a new tab.</span>
          </p>
        )}

        {loaded && signedInAs ? (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <p className="[overflow-wrap:anywhere]">
              You are signed in as <span className="font-semibold">{signedInAs}</span>.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/admin/products" className={primaryButton}>
                Go to products
              </Link>
              <button type="button" onClick={signOut} className={secondaryButton}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim() || !password) {
                setError(!email.trim() && !password ? "Enter an email and a password." : !email.trim() ? "Enter your email." : "Enter your password.");
                return;
              }
              setError(null);
              signIn(email);
              router.push("/admin/products");
            }}
          >
            <label className={labelClass}>
              Email
              <input
                type="email"
                inputMode="email"
                autoComplete="username"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error && !email.trim()}
                aria-describedby={error && !email.trim() ? "signin-error" : undefined}
              />
            </label>
            <label className={labelClass}>
              Password
              <input
                type="password"
                autoComplete="current-password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error && !password}
                aria-describedby={error && !password ? "signin-error" : undefined}
              />
            </label>
            {error && (
              <p id="signin-error" role="alert" className={errorText}>
                <AlertMark />
                <span>{error}</span>
              </p>
            )}
            <button type="submit" className={`${primaryButton} w-full`} disabled={!loaded}>
              Sign in
            </button>
          </form>
        )}

        <Link
          href="/"
          className="mt-6 -ml-1 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-accent underline underline-offset-[3px] hover:decoration-2"
        >
          <ChevronLeftMark />
          Back to the website
        </Link>
      </div>
    </div>
  );
}
