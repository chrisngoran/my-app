import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/components/store-provider";
import { archivo, stencil } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Green Venture Cooperative Coffee",
    template: "%s · Green Venture Coffee",
  },
  description: "Traceable Arabica coffee from family farms in Kumbo, Bui Division, Cameroon.",
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
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
