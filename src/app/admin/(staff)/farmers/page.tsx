import type { Metadata } from "next";
import { AdminFarmers } from "@/components/admin/lot-farmer-editors";

export const metadata: Metadata = {
  title: "Farmers",
  robots: { index: false, follow: false },
};

export default function AdminFarmersPage() {
  return <AdminFarmers />;
}
