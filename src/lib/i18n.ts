export type Lang = "en" | "fr";

export const LANGS: readonly Lang[] = ["en", "fr"];

const T = {
  en: {
    shop: "Shop",
    ourStory: "Our story",
    traceABag: "Trace a bag",
    myOrder: "My order",
    addToOrder: "Add to order",
    soldOut: "Sold out",
    added: "Added",
    inStock: "In stock",
    onlyXLeft: (n: number) => `Only ${n.toLocaleString("en-GB")} left`,
    orderOnWhatsApp: "Order now on WhatsApp",
    askOnWhatsApp: "Ask on WhatsApp",
    soldOutMessage: "Sold out until the next harvest.",
    allInYourOrder: "All in your order",
    viewMyOrder: "View my order",
    payNote: (showRef: boolean) =>
      `Add to order, send it on WhatsApp, then pay by MTN MoMo or Orange Money once we confirm.${showRef ? " You pay in FCFA; other currencies are shown for reference." : ""}`,
  },
  fr: {
    shop: "Boutique",
    ourStory: "Notre histoire",
    traceABag: "Tracer un sac",
    myOrder: "Ma commande",
    addToOrder: "Ajouter",
    soldOut: "Épuisé",
    added: "Ajouté",
    inStock: "En stock",
    onlyXLeft: (n: number) => `Plus que ${n.toLocaleString("fr-FR")}`,
    orderOnWhatsApp: "Commander sur WhatsApp",
    askOnWhatsApp: "Demander sur WhatsApp",
    soldOutMessage: "Épuisé jusqu'à la prochaine récolte.",
    allInYourOrder: "Tout dans la commande",
    viewMyOrder: "Voir ma commande",
    payNote: (showRef: boolean) =>
      `Ajoutez à la commande, envoyez sur WhatsApp, puis payez par MTN MoMo ou Orange Money.${showRef ? " Vous payez en FCFA ; les autres devises sont indicatives." : ""}`,
  },
} as const;

export interface Translations {
  shop: string;
  ourStory: string;
  traceABag: string;
  myOrder: string;
  addToOrder: string;
  soldOut: string;
  added: string;
  inStock: string;
  onlyXLeft: (n: number) => string;
  orderOnWhatsApp: string;
  askOnWhatsApp: string;
  soldOutMessage: string;
  allInYourOrder: string;
  viewMyOrder: string;
  payNote: (showRef: boolean) => string;
}

export function getT(lang: Lang): Translations {
  return T[lang] as Translations;
}
