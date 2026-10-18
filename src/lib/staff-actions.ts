"use server";

import { redirect } from "next/navigation";
import { endStaffSession, passwordMatches, startStaffSession } from "./staff-session";

/** Pages a sign-in may return to. Anything else goes to the admin. */
const RETURN_TO = ["/admin/products", "/portal/insights", "/portal/orders"];
const returnTo = (value: FormDataEntryValue | null) => (typeof value === "string" && RETURN_TO.includes(value) ? value : "/admin/products");

export async function signInStaff(_prev: { error: string } | null, formData: FormData) {
  const attempt = formData.get("password");
  if (typeof attempt !== "string" || !passwordMatches(attempt)) {
    // A short pause makes guessing the password slow.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "That password is not right. Try again." };
  }
  await startStaffSession();
  redirect(returnTo(formData.get("next")));
}

export async function signOutStaff(formData: FormData) {
  await endStaffSession();
  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/portal/") ? returnTo(next) : "/admin");
}
