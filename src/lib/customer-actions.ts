"use server";

import { redirect } from "next/navigation";
import { endCustomerSession } from "./customer-session";

export async function signOutCustomer() {
  await endCustomerSession();
  redirect("/account");
}
