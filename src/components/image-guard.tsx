"use client";

import { useEffect } from "react";

/*
 * Turns away casual saving of the site's photographs: no "Save image" menu on
 * right-click or long-press, and no dragging an image to the desktop. A
 * screenshot still works; the watermark on each photo covers that case.
 * Text, links and the WhatsApp number stay copyable.
 */
export function ImageGuard() {
  useEffect(() => {
    const block = (e: Event) => {
      if (e.target instanceof HTMLImageElement) e.preventDefault();
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);
  return null;
}
