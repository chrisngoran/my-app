import { AdminShell } from "@/components/admin/admin-shell";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
