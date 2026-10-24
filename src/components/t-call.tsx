"use client";

import { useStore } from "@/components/store-provider";
import { getT, type Translations } from "@/lib/i18n";

type FnKeys = {
  [K in keyof Translations]: Translations[K] extends (...args: never[]) => string ? K : never;
}[keyof Translations];

/** Render a translated string from a function key, e.g. <TCall k="fromHarvestYear" args={[2025]} /> */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TCall({ k, args }: { k: FnKeys; args: any[] }) {
  const { lang } = useStore();
  const fn = getT(lang)[k] as (...a: any[]) => string;
  return <>{fn(...args)}</>;
}
