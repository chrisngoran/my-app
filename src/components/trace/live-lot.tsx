"use client";

/*
 * Trace-page pieces that show this browser's admin edits. Each renders the
 * data.ts value on the server and during hydration, then the edited value
 * once the saved edits are loaded.
 *
 * Saved edits come from localStorage, so every value is checked before it is
 * rendered: a wrong type or an out-of-range score falls back to the original
 * record instead of crashing the page, and blank text renders nothing.
 */

import { useState } from "react";
import { useFarmerView, useLotView } from "@/lib/catalog-overrides";
import { CuppingScore } from "./cupping-score";
import { cuppingGrade, formatScore } from "./lot-utils";

function validScore(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : fallback;
}

function validText(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function useLotScore(code: string, fallback: number) {
  return validScore(useLotView(code)?.quality.cuppingScore, fallback);
}

/** The score as text, e.g. "86.75". `fixed` always prints two decimals ("82.00") for aligned columns. */
export function LotScore({ code, fallback, fixed = false }: { code: string; fallback: number; fixed?: boolean }) {
  const score = useLotScore(code, fallback);
  return <>{fixed ? score.toFixed(2) : formatScore(score)}</>;
}

/** "86.75 points, Excellent" for the lot journey. */
export function LotScoreWithGrade({ code, fallback }: { code: string; fallback: number }) {
  const score = useLotScore(code, fallback);
  return (
    <>
      <span className="type-data tabular-nums">{formatScore(score)}</span> points, {cuppingGrade(score)}
    </>
  );
}

export function LotGauge({ code, fallback }: { code: string; fallback: number }) {
  return <CuppingScore score={useLotScore(code, fallback)} />;
}

/**
 * Long text that stays scannable: clamped to a few lines with a toggle when
 * it is long, shown whole when it is short. The clamped text stays in the
 * DOM, so screen readers and find-in-page still reach all of it.
 */
function ClampedText({
  text,
  lines,
  className = "",
  buttonClassName = "",
  moreLabel,
}: {
  text: string;
  lines: 4 | 6;
  className?: string;
  buttonClassName?: string;
  moreLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Roughly four or six lines at phone width; short text never gets a toggle.
  const long = trimmed.length > (lines === 4 ? 240 : 360);
  const clamp = lines === 4 ? "line-clamp-4" : "line-clamp-6";
  return (
    <>
      <p className={`whitespace-pre-line [overflow-wrap:anywhere] ${long && !open ? clamp : ""} ${className}`}>{trimmed}</p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`-mx-1 mt-1 inline-flex min-h-11 items-center rounded-lg px-1 text-sm font-semibold underline underline-offset-[3px] ${buttonClassName}`}
        >
          {open ? "Show less" : moreLabel}
        </button>
      )}
    </>
  );
}

/** The lot's notes in the trace hero (on soil). Renders nothing when blank. */
export function LotNotes({ code, fallback, className }: { code: string; fallback: string; className?: string }) {
  const notes = validText(useLotView(code)?.notes, fallback);
  return (
    <ClampedText text={notes} lines={4} className={className} buttonClassName="text-sand" moreLabel="Read all the notes" />
  );
}

/** A farmer's story. Renders nothing when blank. */
export function FarmerStory({ id, fallback, className }: { id: string; fallback: string; className?: string }) {
  const story = validText(useFarmerView(id)?.story, fallback);
  return (
    <ClampedText text={story} lines={6} className={className} buttonClassName="text-accent" moreLabel="Read the full story" />
  );
}
