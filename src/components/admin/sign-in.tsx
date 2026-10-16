"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signOut, useAdminSession } from "@/lib/admin-session";
import { cooperative } from "@/lib/data";
import { errorText, inputClass, primaryButton, secondaryButton } from "./ui";

export function AdminSignIn() {
  const { email: signedInAs, loaded } = useAdminSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <p className="bg-warm-ink px-4 py-2 text-center text-sm font-semibold text-white">
        Demo admin — changes are saved only in this browser
      </p>
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <h1 className="font-serif text-3xl font-bold text-brand">{cooperative.name}</h1>
        <p className="mt-2 text-muted">Staff area. Sign in to update products, prices, photos and stock on the website.</p>

        <p className="mt-5 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
          Demo: any email and password work
        </p>

        {loaded && signedInAs ? (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <p>
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
                setError("Enter an email and a password.");
                return;
              }
              signIn(email);
              router.push("/admin/products");
            }}
          >
            <label className="block text-sm font-medium">
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
            <label className="block text-sm font-medium">
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
                {error}
              </p>
            )}
            <button type="submit" className={`${primaryButton} w-full`} disabled={!loaded}>
              Sign in
            </button>
          </form>
        )}

        <Link href="/" className="mt-6 -ml-1 inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-medium text-accent hover:underline">
          ← Back to the website
        </Link>
      </div>
    </div>
  );
}
