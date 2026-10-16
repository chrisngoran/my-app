import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Green Venture Cooperative Coffee",
    template: "%s · Green Venture Coffee",
  },
  description: "Traceable Arabica coffee from smallholder farmers in Kumbo, Bui Division, Cameroon.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only rounded-lg bg-surface px-4 py-3 font-semibold text-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:shadow-lg"
        >
          Skip to content
        </a>
        <StoreProvider>
          <SiteHeader />
          <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
