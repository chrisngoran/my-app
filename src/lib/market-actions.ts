"use server";

import { refresh } from "next/cache";
import { hasDatabase } from "./db";
import {
  addFarmer,
  addListing,
  type ListingStatus,
  listingById,
  normalisePhone,
  setCommissionPct,
  setFarmerActive,
  setFarmerPin,
  setListingStatus,
  updateListing,
  validPin,
} from "./market";
import { parseListing } from "./market-input";
import { isStaff } from "./staff-session";

export type FormState = { ok?: string; error?: string } | null;

const SIGNED_OUT = { error: "You are signed out. Reload the page and sign in again." };
const NOT_SAVED = { error: "Not saved: the website could not be reached. Try again." };
const staffOnly = async () => hasDatabase() && (await isStaff());

/** The cooperative's share of each marketplace sale (0–50%). Applies to orders from now on. */
export async function saveCommission(_prev: FormState, f: FormData): Promise<FormState> {
  if (!(await staffOnly())) return SIGNED_OUT;
  const pct = Number(String(f.get("pct") ?? "").replace(",", "."));
  if (!Number.isFinite(pct) || pct < 0 || pct > 50) return { error: "Enter a share from 0 to 50%." };
  try {
    await setCommissionPct(Math.round(pct * 10) / 10);
  } catch {
    return NOT_SAVED;
  }
  refresh();
  return { ok: `Saved. New orders give the cooperative ${Math.round(pct * 10) / 10}% and the farmer the rest.` };
}

export async function createFarmer(_prev: FormState, f: FormData): Promise<FormState> {
  if (!(await staffOnly())) return SIGNED_OUT;
  const name = String(f.get("name") ?? "").trim().slice(0, 80);
  const village = String(f.get("village") ?? "").trim().slice(0, 80);
  const phone = normalisePhone(String(f.get("phone") ?? ""));
  const pin = String(f.get("pin") ?? "").trim();
  const emailRaw = String(f.get("email") ?? "").trim().toLowerCase();
  const email = emailRaw ? emailRaw : null;
  const story = String(f.get("story") ?? "").trim().slice(0, 1500);
  if (!name) return { error: "Enter the farmer's name." };
  if (!phone) return { error: "Enter a phone number, e.g. 6 81 13 99 79." };
  if (!validPin(pin)) return { error: "The PIN must be 4 to 6 digits." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address does not look right." };
  try {
    const id = await addFarmer({ name, village, phone, pin, email, story });
    if (id === null) return { error: "A farmer with that phone number is already on the list." };
  } catch {
    return NOT_SAVED;
  }
  refresh();
  return { ok: `${name} added. Give them their phone number and PIN to sign in.` };
}

export async function resetFarmerPin(farmerId: number, pin: string): Promise<{ error?: string }> {
  if (!(await staffOnly())) return SIGNED_OUT;
  if (!validPin(pin)) return { error: "The PIN must be 4 to 6 digits." };
  try {
    await setFarmerPin(farmerId, pin);
  } catch {
    return NOT_SAVED;
  }
  return {};
}

export async function setFarmerEnabled(farmerId: number, active: boolean): Promise<{ error?: string }> {
  if (!(await staffOnly())) return SIGNED_OUT;
  try {
    await setFarmerActive(farmerId, active);
  } catch {
    return NOT_SAVED;
  }
  return {};
}

/** Staff add coffee for a farmer. It goes on sale straight away: staff are the ones who approve. */
export async function staffAddListing(_prev: FormState, f: FormData): Promise<FormState> {
  if (!(await staffOnly())) return SIGNED_OUT;
  const farmerId = Number(f.get("farmerId"));
  if (!Number.isSafeInteger(farmerId) || farmerId < 1) return { error: "Choose the farmer." };
  const parsed = parseListing(f);
  if ("error" in parsed) return parsed;
  try {
    await addListing(farmerId, parsed.listing, "approved");
  } catch {
    return NOT_SAVED;
  }
  refresh();
  return { ok: `${parsed.listing.name} is on sale.` };
}

/** Staff change a listing's details. Their edits go live at once. */
export async function staffUpdateListing(_prev: FormState, f: FormData): Promise<FormState> {
  if (!(await staffOnly())) return SIGNED_OUT;
  const id = Number(f.get("id"));
  const parsed = parseListing(f);
  if ("error" in parsed) return parsed;
  try {
    const current = await listingById(id);
    if (!current) return { error: "That coffee was not found." };
    await updateListing(id, parsed.listing, current.status === "paused" ? "paused" : "approved");
  } catch {
    return NOT_SAVED;
  }
  refresh();
  return { ok: "Saved." };
}

/** Approve, reject (with a reason the farmer sees), pause or put back on sale. */
export async function decideListing(id: number, status: ListingStatus, note = ""): Promise<{ error?: string }> {
  if (!(await staffOnly())) return SIGNED_OUT;
  if (!["approved", "rejected", "paused"].includes(status)) return { error: "Unknown step." };
  try {
    await setListingStatus(id, status, note.trim().slice(0, 300));
  } catch {
    return NOT_SAVED;
  }
  return {};
}
