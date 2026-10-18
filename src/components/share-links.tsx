import { cooperative } from "@/lib/data";
import { siteUrl } from "@/lib/qr";

/** The Facebook "f" mark, drawn here so no script or image is loaded from Facebook. */
export function FacebookMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} shrink-0`} fill="currentColor">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.88v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

/**
 * "Share on Facebook" and "Share on WhatsApp" for one page. Plain links that
 * open Facebook's or WhatsApp's own share screen, so nothing from Facebook
 * loads on the site and visitors are not tracked by it.
 */
export function ShareLinks({ path, text }: { path: string; text: string }) {
  const url = `${siteUrl()}${path}`;
  const link = "inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground pointer-fine:hover:border-accent";
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">Share:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={link}>
        <FacebookMark className="h-4 w-4 text-[#1877F2]" />
        Facebook
      </a>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={link}>
        WhatsApp
      </a>
    </div>
  );
}

/** "Follow us on Facebook", shown only once the cooperative's page address is set in data.ts. */
export function FollowOnFacebook({ className }: { className: string }) {
  if (!cooperative.facebook) return null;
  return (
    <a href={cooperative.facebook} target="_blank" rel="noopener noreferrer" className={className}>
      <FacebookMark className="h-4 w-4" />
      Follow us on Facebook
    </a>
  );
}
