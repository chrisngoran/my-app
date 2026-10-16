import { farmers as allFarmers, products as allProducts } from "@/lib/data";
import type { CoffeeLot, Farmer } from "@/lib/types";

/**
 * Lot codes are printed in upper case, e.g. GV-2026-014. People type them in
 * many shapes ("gv 2026 14", "GV2026014", "2026-14"), so anything that reads as
 * a year plus a 1–3 digit lot number becomes the canonical code. Other input
 * is only trimmed and upper-cased, so the not-found page can echo it back.
 */
export function normaliseLotCode(input: string) {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = compact.match(/^(?:GV)?(\d{4})(\d{1,3})$/);
  if (match) return `GV-${match[1]}-${match[2].padStart(3, "0")}`;
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

/** "250 g" or "1 kg". */
export function formatWeight(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString("en-GB")} kg` : `${grams.toLocaleString("en-GB")} g`;
}

/** Initials for the farmer disc, e.g. "Delphine Berinyuy" → "DB". */
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Score as printed: 86.75, 84.5, 82. */
export function formatScore(score: number) {
  return score.toFixed(2).replace(/\.?0+$/, "");
}

/** Decodes a route param, tolerating malformed percent-encoding. */
export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function formatHarvestDate(iso: string, month: "long" | "short" = "long") {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function lotFarmers(lot: CoffeeLot): Farmer[] {
  return lot.farmerIds
    .map((id) => allFarmers.find((f) => f.id === id))
    .filter((f): f is Farmer => Boolean(f));
}

export function lotProducts(lot: CoffeeLot) {
  return allProducts.filter((p) => p.lotCode === lot.code);
}

export function formatMetres(m: number) {
  return `${m.toLocaleString("en-GB")} m`;
}

export function altitudeRange(farmers: Farmer[]) {
  if (farmers.length === 0) return "Not recorded";
  const alts = farmers.map((f) => f.altitudeMetres);
  const min = Math.min(...alts);
  const max = Math.max(...alts);
  return min === max ? formatMetres(min) : `${min.toLocaleString("en-GB")}–${formatMetres(max)}`;
}

/** Specialty Coffee Association grade band for a cupping score. */
export function cuppingGrade(score: number) {
  if (score >= 90) return "Outstanding";
  if (score >= 85) return "Excellent";
  if (score >= 80) return "Very good";
  return "Below specialty";
}

/** "Meluf", "Mbve and Shisong", "Mbve, Shisong and Mbiame". */
export function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "Strawberry, jasmine, cocoa nib": sentence case, only the first note capitalised (as on product cards). */
export function notesSentence(notes: string[]) {
  return notes.map((n, i) => (i === 0 ? n : n.charAt(0).toLowerCase() + n.slice(1))).join(", ");
}
