"use client";

/*
 * Demo staff session, kept in sessionStorage so it ends when the tab closes.
 * Any non-empty email and password sign in. In the live version this is a
 * real account check on the server.
 */

import { useSyncExternalStore } from "react";

const SESSION_KEY = "gv-admin-session";

interface Snapshot {
  email: string | null;
  loaded: boolean;
}

const SERVER_SNAPSHOT: Snapshot = { email: null, loaded: false };
let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && typeof (parsed as { email?: unknown }).email === "string"
      ? (parsed as { email: string }).email
      : null;
  } catch {
    return null;
  }
}

function getSnapshot(): Snapshot {
  if (!snapshot) snapshot = { email: read(), loaded: true };
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function set(email: string | null) {
  try {
    if (email) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email }));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable: the session still lasts for this page view.
  }
  snapshot = { email, loaded: true };
  listeners.forEach((l) => l());
}

export function signIn(email: string) {
  set(email.trim());
}

export function signOut() {
  set(null);
}

export function useAdminSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
