import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** The public website's header and footer. The staff admin sits outside this group and has its own. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
