"use server";

import { redirect } from "next/navigation";
import { endStaffSession, passwordMatches, startStaffSession } from "@/lib/staff-session";

export async function signInStaff(_prev: { error: string } | null, formData: FormData) {
  const attempt = formData.get("password");
  if (typeof attempt !== "string" || !passwordMatches(attempt)) {
    // A short pause makes guessing the password slow.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "That password is not right. Try again." };
  }
  await startStaffSession();
  redirect("/portal/insights");
}

export async function signOutStaff() {
  await endStaffSession();
  redirect("/portal/insights");
}
