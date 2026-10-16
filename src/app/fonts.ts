/*
 * The two web fonts, defined once (next/font downloads and self-hosts them at
 * build time, so the browser never contacts Google).
 *
 * - Archivo (variable weight and width): every word people read. Width is the
 *   hierarchy device: condensed for headings, 100% for reading. Latin woff2 is
 *   about 88 KB with the width axis.
 * - Big Shoulders Stencil 800: lot codes only, the way they are stencilled on
 *   export sacks. Not preloaded: most routes (admin, cart, order) never use it.
 *
 * Import `stencil` from here (for example on the bag label); never call a
 * loader a second time.
 */
import { Archivo, Big_Shoulders_Stencil } from "next/font/google";

export const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  style: "normal",
  axes: ["wdth"],
  variable: "--font-archivo",
  fallback: ["system-ui", "Roboto", "Arial", "sans-serif"],
});

export const stencil = Big_Shoulders_Stencil({
  subsets: ["latin"],
  display: "swap",
  weight: "800",
  variable: "--font-stencil-face",
  preload: false,
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});
