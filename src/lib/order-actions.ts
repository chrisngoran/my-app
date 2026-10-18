"use server";

import { adjustStock } from "./catalog-store";
import { deleteOrder, hasDatabase, moveOrder, OUT_OF_STOCK, type OrderStatus } from "./db";
import { isStaff } from "./staff-session";

export type OrderAction = "confirm" | "pack" | "ship" | "deliver" | "cancel" | "delete";

/** For each step: the statuses it can start from and the status it leads to. */
const STEPS: Record<Exclude<OrderAction, "delete">, { from: OrderStatus[]; to: OrderStatus }> = {
  confirm: { from: ["requested", "cancelled"], to: "confirmed" },
  pack: { from: ["confirmed"], to: "packed" },
  ship: { from: ["confirmed", "packed"], to: "shipped" },
  deliver: { from: ["confirmed", "packed", "shipped"], to: "delivered" },
  cancel: { from: ["requested", "confirmed", "packed", "shipped"], to: "cancelled" },
};

/*
 * Staff steps on an order. Confirming takes the bags out of stock; cancelling
 * or deleting an order whose bags had left stock puts them back. Each step
 * only applies from the statuses listed, so a double tap cannot change stock twice.
 */
export async function updateOrder(id: number, action: OrderAction): Promise<{ error?: string }> {
  if (!hasDatabase() || !(await isStaff())) return { error: "You are signed out. Reload the page and sign in again." };
  if (!Number.isSafeInteger(id) || id < 1) return { error: "That order was not found." };
  try {
    if (action === "delete") {
      const removed = await deleteOrder(id);
      if (removed && OUT_OF_STOCK.includes(removed.was)) await adjustStock(removed.lines, 1);
      return {};
    }
    const step = STEPS[action];
    if (!step) return { error: "Unknown step." };
    const moved = await moveOrder(id, step.from, step.to);
    if (!moved) return {};
    const wasOut = OUT_OF_STOCK.includes(moved.was);
    const nowOut = OUT_OF_STOCK.includes(step.to);
    if (!wasOut && nowOut) await adjustStock(moved.lines, -1);
    if (wasOut && !nowOut) await adjustStock(moved.lines, 1);
  } catch (e) {
    console.error("Could not update order", e);
    return { error: "Not saved: the website could not be reached. Try again." };
  }
  return {};
}
