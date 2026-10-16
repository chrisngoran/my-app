import type { Metadata } from "next";
import { AdminSignIn } from "@/components/admin/sign-in";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function AdminSignInPage() {
  return <AdminSignIn />;
}
