import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Staff admin", template: "%s · Staff admin" },
  description: "Demo staff admin for Green Venture Cooperative Coffee.",
  robots: { index: false, follow: false },
};

// The admin has its own header, so hide the public site header and footer.
const HIDE_SITE_CHROME = `body > header, body > footer { display: none !important; }`;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{HIDE_SITE_CHROME}</style>
      {children}
    </>
  );
}
