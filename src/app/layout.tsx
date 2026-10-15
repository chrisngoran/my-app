import type { Metadata } from "next";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
