"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const inputClass =
  "mt-1.5 block min-h-12 w-full rounded-lg border border-field-border bg-surface px-3 py-2 text-base font-normal tracking-normal text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent aria-[invalid=true]:border-danger";

/** Form label: Archivo 600 at 14px; the field inside it resets to body text. */
export const labelClass = "type-label block text-foreground";

/** Built from the shared `btn` recipes in globals.css. Staff controls stay 48px tall. */
export const primaryButton = "btn btn-primary min-h-12";

export const secondaryButton = "btn btn-secondary min-h-12";

/** Field-level error text. It fades in when it appears. Pair it with <AlertMark /> so it is never colour alone. */
export const errorText =
  "mt-1.5 flex items-start gap-1.5 text-sm font-medium tracking-normal text-danger transition-[opacity,translate] duration-180 ease-out starting:-translate-y-1 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-150";

/** Muted hint under a field. */
export const hintText = "mt-1.5 block text-sm font-normal tracking-normal text-muted";

/** 16px warning mark for errors (authored SVG, always next to text). */
export function AlertMark({ className = "mt-0.5 h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.75v3.75M8 11.1v.15" />
    </svg>
  );
}

/** 16px information mark in leaf, for the "live version" callout. */
export function InfoMark({ className = "mt-0.5 h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v4M8 4.9v.15" />
    </svg>
  );
}

/** 16px tick for saved states. */
export function CheckMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3.5 8.5 3 3 6-6.5" />
    </svg>
  );
}

/** 16px back chevron for "All products" (authored, not a glyph). */
export function ChevronLeftMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={`shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3.5 5.5 8l4.5 4.5" />
    </svg>
  );
}

/** Hint under a field that turns into the error, with its icon, when there is one. */
export function FieldHint({ id, error, children }: { id?: string; error?: string | null; children?: React.ReactNode }) {
  if (error) {
    return (
      <span id={id} className={errorText}>
        <AlertMark />
        <span>{error}</span>
      </span>
    );
  }
  if (!children) return null;
  return (
    <span id={id} className={hintText}>
      {children}
    </span>
  );
}

/** "Edited" marker: parchment, the colour of the record (11.19:1). */
export function EditedChip() {
  return <span className="shrink-0 rounded-md bg-sand px-2 py-0.5 text-xs font-semibold text-brand">Edited</span>;
}

/** Initials for a farmer's disc, e.g. "Delphine Berinyuy" → "DB". */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

/** Small inline spinner for busy states. */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`${className} shrink-0 animate-spin [animation-duration:700ms] motion-reduce:animate-none`}
    >
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Large on/off switch with its label, easy to tap on a phone. The bordered
 * variant stands alone in a form; `bare` sits in a list row (no box inside a box).
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  bare = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  bare?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`group flex min-h-12 w-full min-w-0 touch-manipulation items-center justify-between gap-3 rounded-lg py-2 text-left [transition:background-color_150ms_ease] ${
        bare ? "px-0" : "border border-field-border bg-surface px-3 pointer-fine:hover:bg-background active:bg-background"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full [transition:background-color_180ms_ease] ${checked ? "bg-accent" : "bg-field-border"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-[translate,scale] duration-180 ease-out group-active:scale-92 motion-reduce:transition-none ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

export interface ToastMessage {
  text: string;
  tone: "success" | "error";
}

const TOAST_EXIT_MS = 160;

/**
 * A short-lived message at the bottom of the screen. Returns the element to render and a function to show a message.
 * `raised` lifts it on phones so it clears a sticky action bar.
 */
export function useToast({ raised = false }: { raised?: boolean } = {}) {
  const [message, setMessage] = useState<(ToastMessage & { id: number; leaving?: boolean }) | null>(null);

  useEffect(() => {
    if (!message) return;
    if (message.leaving) {
      const t = window.setTimeout(() => setMessage(null), TOAST_EXIT_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(
      () => setMessage((m) => (m && m.id === message.id ? { ...m, leaving: true } : m)),
      message.tone === "error" ? 6000 : 3500,
    );
    return () => window.clearTimeout(t);
  }, [message]);

  const show = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
    setMessage({ text, tone, id: Date.now() });
  }, []);

  const toast = (
    <div
      className={`pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 ${
        raised ? "bottom-[calc(7rem+env(safe-area-inset-bottom))] sm:bottom-4" : "bottom-4"
      }`}
      role="status"
      aria-live="polite"
    >
      {message && (
        <p
          key={message.id}
          className={`pointer-events-auto flex max-w-md min-w-0 items-start gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-[var(--shadow-float)] [overflow-wrap:anywhere] transition-[opacity,translate] ease-out motion-reduce:transition-opacity ${
            message.tone === "error" ? "bg-danger text-white" : "on-dark bg-brand text-sand"
          } ${
            message.leaving
              ? "translate-y-2 opacity-0 duration-160 motion-reduce:translate-y-0"
              : "duration-240 starting:translate-y-full starting:opacity-0 motion-reduce:duration-150"
          }`}
        >
          {message.tone === "error" ? <AlertMark /> : <CheckMark className="mt-0.5 h-4 w-4" />}
          <span>{message.text}</span>
        </p>
      )}
    </div>
  );

  return { toast, show };
}

/** A button that asks "Are you sure?" inline before running the action. */
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  onConfirm,
  className = secondaryButton,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  // Move focus into the question when it opens, and back to the trigger when it is cancelled.
  useEffect(() => {
    if (asking) cancel.current?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      trigger.current?.focus();
    }
  }, [asking]);

  if (!asking) {
    return (
      <button ref={trigger} type="button" className={className} onClick={() => setAsking(true)}>
        {label}
      </button>
    );
  }
  return (
    <div
      role="alertdialog"
      aria-label={question}
      className="w-full origin-top-left rounded-xl border border-danger/25 bg-danger-soft p-3 transition-[opacity,scale] duration-200 ease-out starting:scale-98 starting:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-150"
    >
      <p className="text-sm font-semibold text-danger">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn min-h-12 bg-danger text-white hover:bg-danger/90"
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
        >
          {confirmLabel}
        </button>
        <button
          ref={cancel}
          type="button"
          className={secondaryButton}
          onClick={() => {
            returnFocus.current = true;
            setAsking(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AdminLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-border/50 motion-reduce:animate-none" />
      ))}
    </div>
  );
}

export function PageTitle({ title, intro }: { title: string; intro?: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl leading-tight font-bold text-brand [font-stretch:88%]">{title}</h1>
      {intro && <p className="mt-1.5 max-w-[60ch] text-muted">{intro}</p>}
    </div>
  );
}
