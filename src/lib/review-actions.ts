"use server";

import { customerId } from "./customer-session";
import { products } from "./data";
import { hasBought, hasDatabase, saveReview, setReviewHidden } from "./db";
import { isStaff } from "./staff-session";

export type ReviewState = { ok?: true; error?: string } | null;

/** A signed-in customer rates a coffee they have bought: 1–5 stars and an optional comment. */
export async function submitReview(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const id = hasDatabase() ? await customerId() : null;
  if (!id) return { error: "Sign in again to leave a review." };
  const slug = formData.get("slug");
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").trim().slice(0, 1000);
  if (typeof slug !== "string" || !products.some((p) => p.slug === slug)) return { error: "That coffee was not found." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Choose from 1 to 5 stars." };
  try {
    if (!(await hasBought(id, slug))) return { error: "Reviews are open to customers whose order of this coffee was confirmed." };
    await saveReview(id, slug, rating, body);
  } catch (e) {
    console.error("Could not save review", e);
    return { error: "Not saved: the website could not be reached. Try again." };
  }
  return { ok: true };
}

/** Staff hide a review (abusive, off-topic) or show it again. */
export async function setHidden(id: number, hidden: boolean): Promise<{ error?: string }> {
  if (!hasDatabase() || !(await isStaff())) return { error: "You are signed out. Reload the page and sign in again." };
  if (!Number.isSafeInteger(id) || id < 1) return { error: "That review was not found." };
  try {
    await setReviewHidden(id, hidden);
  } catch (e) {
    console.error("Could not update review", e);
    return { error: "Not saved: the website could not be reached. Try again." };
  }
  return {};
}
