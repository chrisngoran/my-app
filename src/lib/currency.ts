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
  const value = convertFromXaf(amountXaf, currency);
  if (currency === "XAF") {
    return `${Math.round(value).toLocaleString("fr-FR").replace(/ /g, " ")} FCFA`;
  }
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, minimumFractionDigits: 2 }).format(value);
}
