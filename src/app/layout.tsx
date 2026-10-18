import type { Metadata, Viewport } from "next";
import { ImageGuard } from "@/components/image-guard";
import { StoreProvider } from "@/components/store-provider";
import { VisitorAnalytics } from "@/components/visitor-analytics";
import { siteUrl } from "@/lib/qr";
import { archivo, stencil } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Green Venture Cooperative Coffee",
    template: "%s · Green Venture Coffee",
  },
  description: "Traceable Arabica coffee from family farms in Kumbo, Bui Division, Cameroon.",
  // Every shared link (Facebook, WhatsApp) shows a card with this picture, unless a page sets its own.
  metadataBase: new URL(siteUrl()),
  openGraph: {
    type: "website",
    siteName: "Green Venture Cooperative Coffee",
    locale: "en_GB",
    title: "Green Venture Cooperative Coffee",
    description: "Traceable Arabica from family farms in Kumbo, Cameroon. Order on WhatsApp, pay by MTN MoMo or Orange Money.",
    images: [{ url: "/share/site.jpg", width: 1200, height: 630, alt: "Ripe coffee cherries with the Green Venture seal" }],
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${stencil.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-lg bg-surface px-4 py-3 font-semibold text-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:shadow-[var(--shadow-float)]"
        >
          Skip to content
        </a>
        <ImageGuard />
        <StoreProvider>{children}</StoreProvider>
        <VisitorAnalytics />
      </body>
    </html>
  );
}
