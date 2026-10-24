"use client";

import { useStore } from "@/components/store-provider";
import { getT, type Translations } from "@/lib/i18n";

/** Render a translated string inside any server component. Only for string keys — function keys return null. */
export function T({ k }: { k: keyof Translations }) {
  const { lang } = useStore();
  const val = getT(lang)[k];
  if (typeof val === "function") return null;
  return <>{val}</>;
}
