import type { ListingInput } from "./market";

/** Checks a coffee listing form. Returns the listing, or the first problem in plain words. */
export function parseListing(f: FormData): { listing: ListingInput } | { error: string } {
  const text = (k: string, max: number) => String(f.get(k) ?? "").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").trim().slice(0, max);
  const whole = (k: string) => Number(String(f.get(k) ?? "").replace(/\s/g, ""));
  const name = text("name", 80);
  const kind = f.get("kind") === "green" ? "green" : f.get("kind") === "roasted" ? "roasted" : null;
  const weightGrams = whole("weightGrams");
  const priceXaf = whole("priceXaf");
  const stock = whole("stock");
  const description = text("description", 1500);
  const image = String(f.get("image") ?? "");
  if (!name) return { error: "Give the coffee a name." };
  if (!kind) return { error: "Choose roasted or green coffee." };
  if (!Number.isInteger(weightGrams) || weightGrams < 50 || weightGrams > 60000) return { error: "Weight: a whole number of grams, from 50 to 60 000." };
  if (!Number.isInteger(priceXaf) || priceXaf < 100 || priceXaf > 5_000_000) return { error: "Price: a whole number of FCFA, at least 100." };
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return { error: "Bags available: a whole number, 0 or more." };
  if (image && (!/^data:image\/(jpeg|png|webp);base64,/.test(image) || image.length > 2_000_000)) return { error: "The photo could not be used. Try a smaller one." };
  return { listing: { name, kind, weightGrams, priceXaf, stock, description, image: image || undefined } };
}
