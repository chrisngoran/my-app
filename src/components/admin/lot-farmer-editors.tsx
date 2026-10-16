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
import { AdminLoading, inputClass, PageTitle, primaryButton, secondaryButton, useToast } from "./ui";

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
  const ids = useId();
  if (!lot || !original) return null;

  const names = lot.farmerIds.map((id) => getFarmer(id)?.name).filter(Boolean).join(", ");
  const edited = !!overrides.lots[code];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lot || !original) return;
    const value = Number(score);
    const unchanged = value === lot.quality.cuppingScore;
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
    const ok = updateLot(code, {
      notes: notes.trim() !== original.notes ? notes.trim() : undefined,
      cuppingScore: value !== original.quality.cuppingScore ? value : undefined,
    });
    show(ok ? `Lot ${code} saved.` : "Could not save: this browser is blocking storage.", ok ? "success" : "error");
  }

  return (
    <form noValidate onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-mono text-lg font-bold text-brand">{code}</h2>
          <p className="text-sm text-muted">
            {lot.processingMethod} · {lot.variety}
          </p>
          <p className="text-sm text-muted">Farmers: {names}</p>
        </div>
        {edited && <span className="rounded-full bg-warm/15 px-2 py-0.5 text-xs font-medium text-warm">Edited</span>}
      </div>
      <label className="mt-4 block text-sm font-medium">
        Notes
        <textarea className={`${inputClass} min-h-24`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <label className="mt-4 block text-sm font-medium sm:max-w-48">
        Cupping score (0–100)
        <input
          className={inputClass}
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
        <span id={`${ids}-score`} className={`mt-1 block text-sm ${error ? "text-red-700" : "text-muted"}`}>
          {error ?? "80 or more is specialty grade"}
        </span>
      </label>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="submit" className={primaryButton}>
          Save lot
        </button>
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
  if (!farmer || !original) return null;
  const edited = !!overrides.farmers[id];
  const lot = lots.find((l) => l.farmerIds.includes(id));

  return (
    <form
      noValidate
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!story.trim()) {
          setError("Write a short story, or undo your changes to use the original.");
          return;
        }
        setError(null);
        const ok = updateFarmer(id, { story: story.trim() !== original.story ? story.trim() : undefined });
        show(ok ? `${farmer.name}'s story saved.` : "Could not save: this browser is blocking storage.", ok ? "success" : "error");
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-bold text-brand">{farmer.name}</h2>
          <p className="text-sm text-muted">
            {farmer.village} · member since {farmer.joinedYear}
          </p>
        </div>
        {edited && <span className="rounded-full bg-warm/15 px-2 py-0.5 text-xs font-medium text-warm">Edited</span>}
      </div>
      <label className="mt-4 block text-sm font-medium">
        Story
        <textarea
          className={`${inputClass} min-h-28`}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          aria-invalid={!!error}
        />
        {error && <span className="mt-1 block text-sm text-red-700">{error}</span>}
      </label>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="submit" className={primaryButton}>
          Save story
        </button>
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
