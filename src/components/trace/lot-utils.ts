import { farmers as allFarmers, products as allProducts } from "@/lib/data";
import type { CoffeeLot, Farmer } from "@/lib/types";

/** Lot codes are printed in upper case, e.g. GV-2026-014. */
export function normaliseLotCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
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
  if (farmers.length === 0) return "—";
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
