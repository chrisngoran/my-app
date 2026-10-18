"use server";

import { adjustStock } from "./catalog-store";
import { deleteOrder, hasDatabase, moveOrder } from "./db";
import { isStaff } from "./staff-session";

export type OrderAction = "confirm" | "cancel" | "delete";

/*
 * Staff decisions on an order request. Confirming takes the bags out of
 * stock; cancelling or deleting a confirmed order puts them back. Each step
 * only applies once, so a double tap cannot change stock twice.
 */
export async function updateOrder(id: number, action: OrderAction): Promise<{ error?: string }> {
  if (!hasDatabase() || !(await isStaff())) return { error: "You are signed out. Reload the page and sign in again." };
  if (!Number.isSafeInteger(id) || id < 1) return { error: "That order was not found." };
  try {
    if (action === "confirm") {
      const moved = await moveOrder(id, ["requested", "cancelled"], "confirmed");
      if (moved) await adjustStock(moved.lines, -1);
    } else if (action === "cancel") {
      const moved = await moveOrder(id, ["requested", "confirmed"], "cancelled");
      if (moved?.was === "confirmed") await adjustStock(moved.lines, 1);
    } else {
      const removed = await deleteOrder(id);
      if (removed?.was === "confirmed") await adjustStock(removed.lines, 1);
    }
  } catch (e) {
    console.error("Could not update order", e);
    return { error: "Not saved: the website could not be reached. Try again." };
  }
  return {};
}
