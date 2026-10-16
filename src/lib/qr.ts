import QRCode from "qrcode";

const FALLBACK_SITE_URL = "https://greenventure.example";

/** Public base URL of the site, without a trailing slash. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, "");
}

/** The provenance URL encoded in the QR code printed on each bag. */
export function traceUrl(lotCode: string) {
  return `${siteUrl()}/trace/${encodeURIComponent(lotCode)}`;
}

/**
 * Generates an SVG QR code (as a markup string) pointing at a lot's
 * provenance page. The SVG scales to its container via its viewBox.
 */
export async function lotQrSvg(
  lotCode: string,
  options: { dark?: string; light?: string; margin?: number } = {},
): Promise<string> {
  return QRCode.toString(traceUrl(lotCode), {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: options.margin ?? 1,
    color: { dark: options.dark ?? "#2a1d16", light: options.light ?? "#ffffff" },
  });
}
