"use client";

import { usePathname } from "next/navigation";
import { safeDecode } from "./lot-utils";

/**
 * The code the visitor asked for, read from the URL (not-found pages get no
 * params). Long or odd input is shortened for the heading; the full text
 * stays in the title attribute.
 */
export function MissingLotCode() {
  const pathname = usePathname() ?? "";
  const segment = pathname.split("/")[2] ?? "";
  const code = safeDecode(segment).trim().toUpperCase();
  if (!code) return <>that lot</>;
  const short = code.length > 24 ? `${code.slice(0, 23)}…` : code;
  return (
    <>
      lot{" "}
      <span title={code} className="font-mono [overflow-wrap:anywhere]">
        {short}
      </span>
    </>
  );
}
