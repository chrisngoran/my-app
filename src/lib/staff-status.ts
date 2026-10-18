"use client";

import { useEffect, useState } from "react";

export interface StaffStatus {
  loaded: boolean;
  /** A database is connected, so the admin edits the live shop and needs the staff password. */
  shared: boolean;
  passwordSet: boolean;
  /** "Continue with Google" is set up. */
  google: boolean;
  /** The Google account signed in here, or empty for the staff password. */
  email: string;
  /** This browser is signed in with the staff password. */
  staff: boolean;
}

const LOADING: StaffStatus = { loaded: false, shared: false, passwordSet: false, google: false, staff: false, email: "" };

/** Asks the site whether staff sign-in is the real one and whether this browser is signed in. */
export function useStaffStatus() {
  const [status, setStatus] = useState<StaffStatus>(LOADING);
  useEffect(() => {
    let live = true;
    fetch("/api/staff", { cache: "no-store" })
      .then((r) => r.json() as Promise<Omit<StaffStatus, "loaded">>)
      .then((s) => live && setStatus({ ...s, loaded: true }))
      // Unreachable: treat it as the demo, which keeps working offline.
      .catch(() => live && setStatus({ ...LOADING, loaded: true }));
    return () => {
      live = false;
    };
  }, []);
  return status;
}
