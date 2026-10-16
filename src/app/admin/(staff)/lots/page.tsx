import type { Metadata } from "next";
import { AdminLots } from "@/components/admin/lot-farmer-editors";

export const metadata: Metadata = {
  title: "Coffee lots",
  robots: { index: false, follow: false },
};

export default function AdminLotsPage() {
  return <AdminLots />;
}
