"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Price } from "@/components/price";
import { useStore } from "@/components/store-provider";
import { useProductView } from "@/lib/catalog-overrides";
import { getT } from "@/lib/i18n";
import { askNextRoastLink } from "@/lib/whatsapp";
import { AddToCartButton } from "./add-to-cart-button";
import { QuantityStepper } from "./quantity-stepper";

/** Price, quantity and ordering. The props are the defaults; admin edits saved in this browser win. */
export function ProductPurchase({
  slug,
  name: defaultName,
  priceXaf: defaultPriceXaf,
  stock: defaultStock,
}: {
  slug: string;
  name: string;
  priceXaf: number;
  stock: number;
}) {
  const live = useProductView(slug);
  const name = live?.name ?? defaultName;
  const priceXaf = live?.priceXaf ?? defaultPriceXaf;
  const stock = live?.stock ?? defaultStock;
  const hidden = live?.hidden ?? false;
  // Never let the order list hold more bags than are in stock.
  const { cart, currency, addToCart, lang } = useStore();
  const t = getT(lang);
  const router = useRouter();
  const inList = cart.find((i) => i.slug === slug)?.quantity ?? 0;
  const remaining = Math.max(0, stock - inList);
  const allInList = stock > 0 && remaining === 0;
  const max = Math.max(1, Math.min(remaining, 20));
  const [chosen, setQuantity] = useState(1);
  // Stock can drop while the page is open (e.g. edited in the admin).
  const quantity = Math.min(chosen, max);
  const soldOut = stock <= 0 || hidden;
  // Once something is added on this page, keep a route to the order list in view.
  const [addedHere, setAddedHere] = useState(false);

  if (hidden) {
    return (
      <div className="border-y border-border py-4">
        <p className="font-semibold text-brand">This coffee is not on sale at the moment.</p>
        <p className="mt-1 text-sm text-muted">Browse the shop for coffee available now, or ask us on WhatsApp when it will be back.</p>
        <a href={askNextRoastLink()} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-3">
          <WhatsAppGlyph />
          {t.askOnWhatsApp}
        </a>
      </div>
    );
  }

  return (
    // No card at any width: hairlines set it apart, so the parchment lot record stays the page's only filled panel.
    <div className="border-y border-border py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Price xaf={priceXaf} className="type-data min-w-0 text-[2rem] text-brand [overflow-wrap:anywhere]" />
        {/* Always laid out, hidden at one bag, so the first "+" tap does not push the stepper down. */}
        <p className={`text-sm text-muted ${quantity > 1 ? "" : "invisible"}`} aria-hidden={quantity > 1 ? undefined : true}>
          <span className="tabular">{quantity}</span> bags:{" "}
          <Price xaf={priceXaf * quantity} className="type-data text-foreground" />
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <QuantityStepper
          label="Quantity"
          value={quantity}
          min={1}
          max={max}
          onChange={(q) => setQuantity(Math.min(max, Math.max(1, q)))}
        />
        <AddToCartButton
          slug={slug}
          name={name}
          quantity={quantity}
          disabled={soldOut || allInList}
          disabledLabel={allInList ? t.allInYourOrder : undefined}
          onAdded={() => setAddedHere(true)}
          className="flex-1 sm:flex-none sm:px-8"
        />
      </div>
      {allInList && (
        <p className="mt-2 text-sm text-muted">
          Your order list already holds all <span className="tabular">{stock.toLocaleString("en-GB")}</span> in stock.
        </p>
      )}
      {(addedHere || allInList) && (
        <Link
          href="/cart"
          className="anim-enter mt-2 inline-flex min-h-11 items-center gap-1 font-semibold text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
        >
          {t.viewMyOrder}
        </Link>
      )}
      {soldOut ? (
        <div className="mt-3">
          <p className="font-semibold text-muted">{t.soldOutMessage}</p>
          <a href={askNextRoastLink()} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-2 w-full">
            <WhatsAppGlyph />
            {t.askOnWhatsApp}
          </a>
        </div>
      ) : (
        // Goes through the details form, so every order carries a name and town and is counted on the dashboard.
        <button
          type="button"
          onClick={() => {
            // Already in the order list: go straight to the form rather than adding the bags twice.
            if (inList === 0) addToCart(slug, quantity);
            router.push("/order");
          }}
          className="btn mt-3 w-full border-[1.5px] border-whatsapp bg-surface text-whatsapp pointer-fine:hover:bg-whatsapp/5"
        >
          <WhatsAppGlyph />
          {t.orderOnWhatsApp}
        </button>
      )}
      <p className="mt-3 text-sm text-muted">{t.payNote(currency !== "XAF")}</p>
    </div>
  );
}

/** Chat-bubble-with-handset mark for WhatsApp actions. */
function WhatsAppGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
      <path d="M16.6 14.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}
