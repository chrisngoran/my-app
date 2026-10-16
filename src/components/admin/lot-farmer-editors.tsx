"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  resetFarmer,
  resetLot,
  updateFarmer,
  updateLot,
  useCatalogOverrides,
  useFarmerView,
  useLotView,
} from "@/lib/catalog-overrides";
import { farmers, getFarmer, getLot, lots } from "@/lib/data";
import {
  AdminLoading,
  EditedChip,
  FieldHint,
  hintText,
  initials,
  inputClass,
  labelClass,
  PageTitle,
  primaryButton,
  secondaryButton,
  useToast,
} from "./ui";

/** Lot notes sit in the trace hero above the cupping score; keep them short enough not to push it off the screen. */
const NOTES_MAX = 400;
/** Farmer stories show on trace and Our story. */
const STORY_MAX = 1200;

/** "120/400" under a long text field. */
function CharCount({ id, used, max }: { id: string; used: number; max: number }) {
  return (
    <span id={id} className={`${hintText} text-right tabular-nums ${used > max ? "font-semibold text-danger" : ""}`}>
      <span className="sr-only">Characters used: </span>
      {used}/{max}
    </span>
  );
}

/** Shown next to Save while a card has edits that are not saved yet. */
function UnsavedNote({ show }: { show: boolean }) {
  return (
    <>
      {show && (
        <span aria-hidden="true" className="inline-flex items-center gap-2 text-sm font-medium text-cherry sm:ml-1">
          <span className="h-2 w-2 rounded-full bg-cherry" />
          Unsaved changes
        </span>
      )}
      <span className="sr-only" aria-live="polite">
        {show ? "Unsaved changes" : ""}
      </span>
    </>
  );
}

type Show = (text: string, tone?: "success" | "error") => void;

// ---------------------------------------------------------------------------
// Lots
// ---------------------------------------------------------------------------

export function AdminLots() {
  const { loaded, resets } = useCatalogOverrides();
  const { toast, show } = useToast();
  return (
    <div>
      <PageTitle title="Coffee lots" intro="Update the tasting notes and cupping score shown on the traceability pages." />
      {!loaded ? (
        <div className="mt-6">
          <AdminLoading />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {lots.map((lot) => (
            <li key={lot.code}>
              <LotCard key={resets} code={lot.code} show={show} />
            </li>
          ))}
        </ul>
      )}
      {toast}
    </div>
  );
}

function LotCard({ code, show }: { code: string; show: Show }) {
  const lot = useLotView(code);
  const original = getLot(code);
  const { overrides } = useCatalogOverrides();
  const [notes, setNotes] = useState(lot?.notes ?? "");
  const [score, setScore] = useState(String(lot?.quality.cuppingScore ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const ids = useId();
  if (!lot || !original) return null;

  const dirty = notes.trim() !== lot.notes.trim() || Number(score) !== lot.quality.cuppingScore;
  const names = lot.farmerIds.map((id) => getFarmer(id)?.name).filter(Boolean).join(", ");
  const edited = !!overrides.lots[code];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lot || !original) return;
    const value = Number(score);
    const unchanged = value === lot.quality.cuppingScore;
    const notesProblem = !notes.trim()
      ? "Write a short note, or undo your changes to use the original."
      : notes.trim().length > NOTES_MAX
        ? `Keep the notes to ${NOTES_MAX} characters or fewer.`
        : null;
    setNotesError(notesProblem);
    if (!unchanged) {
      if (score.trim() === "" || !Number.isFinite(value) || value < 0 || value > 100) {
        setError("Enter a score from 0 to 100.");
        return;
      }
      if (Math.round(value * 10) / 10 !== value) {
        setError("Use at most one decimal, e.g. 86.5.");
        return;
      }
    }
    setError(null);
    if (notesProblem) return;
    const ok = updateLot(code, {
      notes: notes.trim() !== original.notes ? notes.trim() : undefined,
      cuppingScore: value !== original.quality.cuppingScore ? value : undefined,
    });
    show(ok ? `Lot ${code} saved.` : "Could not save: this browser is blocking storage.", ok ? "success" : "error");
  }

  return (
    <form noValidate onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="type-stencil text-xl text-brand">{code}</h2>
          <p className="mt-1.5 text-sm text-muted">
            {lot.processingMethod} process, {lot.variety}
          </p>
          <p className="text-sm text-muted">Farmers: {names}</p>
        </div>
        {edited && <EditedChip />}
      </div>
      <label className={`${labelClass} mt-5`}>
        Notes
        <textarea
          className={`${inputClass} min-h-24`}
          value={notes}
          maxLength={Math.max(NOTES_MAX, lot.notes.length)}
          onChange={(e) => setNotes(e.target.value)}
          aria-invalid={!!notesError}
          aria-describedby={`${ids}-notes-err ${ids}-notes-count`}
        />
        <span className="flex items-start justify-between gap-3">
          <FieldHint id={`${ids}-notes-err`} error={notesError} />
          <CharCount id={`${ids}-notes-count`} used={notes.length} max={NOTES_MAX} />
        </span>
      </label>
      <label className={`${labelClass} mt-5 sm:max-w-56`}>
        Cupping score (0–100)
        <input
          className={`${inputClass} tabular-nums`}
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          step={0.1}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={`${ids}-score`}
        />
        <FieldHint id={`${ids}-score`} error={error}>
          80 or more is specialty grade
        </FieldHint>
      </label>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="submit" className={primaryButton}>
          Save lot
        </button>
        <UnsavedNote show={dirty} />
        <Link href={`/trace/${code}`} className={secondaryButton}>
          View on website
        </Link>
        {edited && (
          <button
            type="button"
            className={secondaryButton}
            onClick={() => {
              if (!resetLot(code)) return show("Could not reset: this browser is blocking storage.", "error");
              setNotes(original.notes);
              setScore(String(original.quality.cuppingScore));
              setError(null);
              setNotesError(null);
              show(`Lot ${code} put back to the original.`);
            }}
          >
            Undo changes
          </button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Farmers
// ---------------------------------------------------------------------------

export function AdminFarmers() {
  const { loaded, resets } = useCatalogOverrides();
  const { toast, show } = useToast();
  return (
    <div>
      <PageTitle title="Farmers" intro="Update the farmer stories shown on the traceability pages and Our story." />
      {!loaded ? (
        <div className="mt-6">
          <AdminLoading />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {farmers.map((f) => (
            <li key={f.id}>
              <FarmerCard key={resets} id={f.id} show={show} />
            </li>
          ))}
        </ul>
      )}
      {toast}
    </div>
  );
}

function FarmerCard({ id, show }: { id: string; show: Show }) {
  const farmer = useFarmerView(id);
  const original = getFarmer(id);
  const { overrides } = useCatalogOverrides();
  const [story, setStory] = useState(farmer?.story ?? "");
  const [error, setError] = useState<string | null>(null);
  const ids = useId();
  if (!farmer || !original) return null;
  const edited = !!overrides.farmers[id];
  const dirty = story.trim() !== farmer.story.trim();
  const lot = lots.find((l) => l.farmerIds.includes(id));

  return (
    <form
      noValidate
      className="rounded-2xl border border-border bg-surface p-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!story.trim()) {
          setError("Write a short story, or undo your changes to use the original.");
          return;
        }
        if (story.trim().length > STORY_MAX) {
          setError(`Keep the story to ${STORY_MAX} characters or fewer.`);
          return;
        }
        setError(null);
        const ok = updateFarmer(id, { story: story.trim() !== original.story ? story.trim() : undefined });
        show(ok ? `${farmer.name}'s story saved.` : "Could not save: this browser is blocking storage.", ok ? "success" : "error");
      }}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand text-base font-bold text-brand">
          {initials(farmer.name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="type-title text-brand [overflow-wrap:anywhere]">{farmer.name}</h2>
          <p className="text-sm text-muted">
            {farmer.village}, member since {farmer.joinedYear}
          </p>
        </div>
        {edited && <EditedChip />}
      </div>
      <label className={`${labelClass} mt-5`}>
        Story
        <textarea
          className={`${inputClass} min-h-28`}
          value={story}
          maxLength={Math.max(STORY_MAX, farmer.story.length)}
          onChange={(e) => setStory(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={`${ids}-story ${ids}-story-count`}
        />
        <span className="flex items-start justify-between gap-3">
          <FieldHint id={`${ids}-story`} error={error} />
          <CharCount id={`${ids}-story-count`} used={story.length} max={STORY_MAX} />
        </span>
      </label>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="submit" className={primaryButton}>
          Save story
        </button>
        <UnsavedNote show={dirty} />
        <Link href={lot ? `/trace/${lot.code}` : "/our-story"} className={secondaryButton}>
          View on website
        </Link>
        {edited && (
          <button
            type="button"
            className={secondaryButton}
            onClick={() => {
              if (!resetFarmer(id)) return show("Could not reset: this browser is blocking storage.", "error");
              setStory(original.story);
              setError(null);
              show(`${farmer.name}'s story put back to the original.`);
            }}
          >
            Undo changes
          </button>
        )}
      </div>
    </form>
  );
}
