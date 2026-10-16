"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signOut, useAdminSession } from "@/lib/admin-session";
import { cooperative } from "@/lib/data";
import { inputClass, primaryButton, secondaryButton } from "./ui";

export function AdminSignIn() {
  const { email: signedInAs, loaded } = useAdminSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <p className="bg-warm px-4 py-2 text-center text-sm font-semibold text-white">
        Demo admin — changes are saved only in this browser
      </p>
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Staff area</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-brand">{cooperative.name}</h1>
        <p className="mt-2 text-muted">Sign in to update products, prices, photos and stock on the website.</p>

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
              />
            </label>
            {error && (
              <p role="alert" className="text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            <button type="submit" className={`${primaryButton} w-full`} disabled={!loaded}>
              Sign in
            </button>
          </form>
        )}

        <Link href="/" className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">
          ← Back to the website
        </Link>
      </div>
    </div>
  );
}
