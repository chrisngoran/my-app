"use client";

import { Analytics } from "@vercel/analytics/next";

/** Visitor numbers in the Vercel dashboard: no cookies, no names. Addresses are sent without the part after "?" (order references). */
export function VisitorAnalytics() {
  return <Analytics beforeSend={(e) => ({ ...e, url: e.url.split("?")[0] })} />;
}
