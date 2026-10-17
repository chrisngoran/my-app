import QRCode from "qrcode";

/*
 * The site's public address, written into every printed QR code. It is set
 * here rather than read from Vercel's settings: an environment value once
 * pointed the codes at another site's address, and a bag already printed
 * cannot be fixed. Change it here when the site moves to its own domain.
 */
const SITE_URL = "https://my-app-gray-three-39.vercel.app";

/** Public base URL of the site, without a trailing slash. */
export function siteUrl() {
  return SITE_URL.replace(/\/+$/, "");
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
