"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { hasDatabase } from "./db";
import { endFarmerSession, farmerId, startFarmerSession } from "./farmer-session";
import {
  addListing,
  clearWrongPins,
  farmerById,
  farmerByPhone,
  listingById,
  normalisePhone,
  pinMatches,
  recordWrongPin,
  setListingStock,
  updateListing,
} from "./market";
import type { FormState } from "./market-actions";
import { parseListing } from "./market-input";

const WRONG = "That phone number and PIN do not match. Check them, or ask the cooperative office.";

export async function farmerSignIn(_prev: FormState, f: FormData): Promise<FormState> {
  if (!hasDatabase()) return { error: "Farmer sign-in is not available yet." };
  const phone = normalisePhone(String(f.get("phone") ?? ""));
  const pin = String(f.get("pin") ?? "").trim();
  const farmer = phone ? await farmerByPhone(phone) : null;
  if (farmer?.locked) return { error: "Too many wrong PINs. Wait 15 minutes, or ask the cooperative office to set a new PIN." };
  if (!farmer || !farmer.active || !farmer.hasPin || !pinMatches(pin, farmer.pinHash)) {
    if (farmer) await recordWrongPin(farmer.id);
    // A short pause makes guessing slow.
    await new Promise((r) => setTimeout(r, 800));
    return { error: WRONG };
  }
  await clearWrongPins(farmer.id);
  await startFarmerSession(farmer.id);
  redirect("/farmer");
}

export async function farmerSignOut() {
  await endFarmerSession();
  redirect("/farmer");
}

/** The signed-in farmer, if they may still sell. */
async function me() {
  if (!hasDatabase()) return null;
  const id = await farmerId();
  const farmer = id ? await farmerById(id) : null;
  return farmer?.active ? farmer : null;
}

const SIGNED_OUT = { error: "You are signed out. Sign in again." };
const NOT_SAVED = { error: "Not saved: the website could not be reached. Try again." };

/** A farmer adds coffee. It waits for the cooperative to approve it. */
export async function farmerAddListing(_prev: FormState, f: FormData): Promise<FormState> {
  const farmer = await me();
  if (!farmer) return SIGNED_OUT;
  const parsed = parseListing(f);
  if ("error" in parsed) return parsed;
  try {
    await addListing(farmer.id, parsed.listing, "pending");
  } catch {
    return NOT_SAVED;
  }
  refresh();
  return { ok: `Sent to the cooperative. ${parsed.listing.name} goes on sale once they approve it.` };
}

/** A farmer changes their coffee. The change is checked again before it shows. */
export async function farmerUpdateListing(_prev: FormState, f: FormData): Promise<FormState> {
  const farmer = await me();
  if (!farmer) return SIGNED_OUT;
  const id = Number(f.get("id"));
  const parsed = parseListing(f);
  if ("error" in parsed) return parsed;
  try {
    const current = await listingById(id);
    if (!current || current.farmerId !== farmer.id) return { error: "That coffee was not found." };
    await updateListing(id, parsed.listing, "pending");
  } catch {
    return NOT_SAVED;
  }
  refresh();
  return { ok: "Sent to the cooperative. The change shows once they approve it." };
}

/** A farmer updates the bags available; coffee on sale stays on sale. */
export async function farmerUpdateStock(listingId: number, stock: number): Promise<{ error?: string }> {
  const farmer = await me();
  if (!farmer) return SIGNED_OUT;
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return { error: "Enter a whole number, 0 or more." };
  try {
    if (!(await setListingStock(listingId, farmer.id, stock))) return { error: "That coffee was not found." };
  } catch {
    return NOT_SAVED;
  }
  refresh();
  return {};
}
