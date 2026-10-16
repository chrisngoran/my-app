import type { Currency } from "./types";

// FCFA is pegged to the euro at a fixed rate. The USD rate floats and is an
// approximation for display only; real charges are always made in FCFA.
export const XAF_PER: Record<Currency, number> = {
  XAF: 1,
  EUR: 655.957,
  USD: 600,
};

export const CURRENCIES: Currency[] = ["XAF", "EUR", "USD"];

export function convertFromXaf(amountXaf: number, currency: Currency) {
  return amountXaf / XAF_PER[currency];
}

export function formatPrice(amountXaf: number, currency: Currency = "XAF") {
  // Unknown currency codes fall back to FCFA instead of throwing a RangeError.
  const code: Currency = CURRENCIES.includes(currency) ? currency : "XAF";
  const value = convertFromXaf(Number.isFinite(amountXaf) ? amountXaf : 0, code);
  if (code === "XAF") {
    return `${Math.round(value).toLocaleString("fr-FR").replace(/ /g, " ")} FCFA`;
  }
  const fmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: code, minimumFractionDigits: 2 });
  // A 1 FCFA item would otherwise read as "€0.00", as if it were free.
  if (value > 0 && value < 0.01) return `< ${fmt.format(0.01)}`;
  return fmt.format(value);
}
