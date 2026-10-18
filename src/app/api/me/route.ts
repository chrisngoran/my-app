import { connection } from "next/server";
import { customerId } from "@/lib/customer-session";
import { customerById, hasDatabase } from "@/lib/db";
import { googleClientConfigured } from "@/lib/google-auth";

/** For the order form: whether customer accounts are on, and who is signed in here. */
export async function GET() {
  await connection();
  const accounts = hasDatabase() && googleClientConfigured();
  const id = accounts ? await customerId() : null;
  const customer = id ? await customerById(id).catch(() => null) : null;
  return Response.json(
    { accounts, signedIn: !!customer, name: customer?.name || customer?.email || "" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
