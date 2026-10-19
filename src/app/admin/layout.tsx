import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Staff admin", template: "%s · Staff admin" },
  description: "Demo staff admin for GREENVENTURES Cooperative Society Ltd.",
  robots: { index: false, follow: false },
};

// The admin sits outside the (site) group, so it never loads the public header and footer.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
      {children}
    </main>
  );
}
