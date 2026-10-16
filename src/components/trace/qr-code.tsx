import { lotQrSvg, traceUrl } from "@/lib/qr";

/** Server component rendering a lot's provenance QR code as inline SVG. */
export async function LotQrCode({
  code,
  className = "",
  dark,
  light,
}: {
  code: string;
  className?: string;
  dark?: string;
  light?: string;
}) {
  const svg = await lotQrSvg(code, { dark, light });
  return (
    <div
      role="img"
      aria-label={`QR code linking to ${traceUrl(code)}`}
      className={`[&_svg]:block [&_svg]:h-full [&_svg]:w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
