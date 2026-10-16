"use client";

import { useState } from "react";
import { btnPrimary } from "./buttons";

/**
 * Prints the bag label. Waits for web fonts first, so the stencilled lot code
 * never prints in the fallback face on a slow connection.
 */
export function PrintButton({ className = "" }: { className?: string }) {
  const [waiting, setWaiting] = useState(false);

  async function onPrint() {
    setWaiting(true);
    try {
      // Cap the wait: a font that never arrives must not block printing.
      await Promise.race([document.fonts?.ready, new Promise((resolve) => window.setTimeout(resolve, 3000))]);
    } catch {
      // Font loading failed; print with the fallback face.
    } finally {
      setWaiting(false);
    }
    window.print();
  }

  return (
    <button type="button" onClick={onPrint} disabled={waiting} className={`${btnPrimary} disabled:cursor-wait ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
        <rect x="6" y="14" width="12" height="7" rx="1" />
      </svg>
      {waiting ? "Preparing label…" : "Print label"}
    </button>
  );
}
