import type { ProductCategory } from "@/lib/types";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  roasted: "Roasted coffee",
  green: "Green coffee",
  "micro-lot": "Micro-lots",
  subscription: "Subscriptions",
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

export function isCategory(value: string | null | undefined): value is ProductCategory {
  return !!value && value in CATEGORY_LABELS;
}

export function formatWeight(grams: number) {
  return grams >= 1000 ? `${grams / 1000} kg` : `${grams} g`;
}

export type DeliveryOption = "cameroon" | "international";

export const SHIPPING_XAF = {
  /** Kumbo and Bamenda, close to the cooperative's warehouse */
  local: 1000,
  /** Anywhere else in Cameroon */
  national: 2000,
  international: 18000,
} as const;

const LOCAL_CITIES = ["kumbo", "bamenda"];

export function isLocalCity(city: string) {
  const c = city.trim().toLowerCase();
  return LOCAL_CITIES.some((name) => c === name || c.startsWith(`${name} `) || c.startsWith(`${name},`));
}

export function deliveryFee(option: DeliveryOption, city: string) {
  if (option === "international") return SHIPPING_XAF.international;
  return isLocalCity(city) ? SHIPPING_XAF.local : SHIPPING_XAF.national;
}

export const CAMEROON_REGIONS = [
  "North West",
  "South West",
  "Adamawa",
  "Centre",
  "East",
  "Far North",
  "Littoral",
  "North",
  "South",
  "West",
];

/** Normalises a Cameroonian mobile number (9 digits starting with 6, optional +237). */
export function normaliseCameroonPhone(input: string): string | null {
  const compact = input.replace(/[\s.\-()]/g, "");
  const match = /^(?:\+?237|00237)?(6\d{8})$/.exec(compact);
  return match ? `+237 ${match[1].replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}` : null;
}

/** Loose check for international numbers: optional +, 7 to 15 digits. */
export function isInternationalPhone(input: string) {
  return /^\+?\d{7,15}$/.test(input.replace(/[\s.\-()]/g, ""));
}
