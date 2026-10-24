export type Lang = "en" | "fr";

export const LANGS: readonly Lang[] = ["en", "fr"];

const T = {
  en: {
    shop: "Shop",
    ourStory: "Our story",
    traceABag: "Trace a bag",
    myOrder: "My order",
    shopHeading: "Coffee from the Bui highlands",
    shopLead: "Roasted coffee, a single-farm micro-lot, green coffee by the kilo for roasters and a monthly subscription. Every bag carries a lot code you can trace to the farms.",
    allCoffee: "All coffee",
    categoryRoasted: "Roasted coffee",
    categoryGreen: "Green coffee",
    categoryMicroLot: "Micro-lots",
    categorySubscription: "Subscriptions",
    tastesLike: "Tastes like",
    aboutTheBag: "About the bag",
    weight: "Weight",
    roast: "Roast",
    otherCoffee: "Other coffee from this harvest",
    shopBreadcrumb: "Shop",
    rotateLots: "Rotating lots",
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
    shopHeading: "Café des hauts plateaux du Bui",
    shopLead: "Café torréfié, micro-lot d'une seule ferme, café vert au kilo et abonnement mensuel. Chaque sac porte un code de lot traçable jusqu'aux fermes.",
    allCoffee: "Tout le café",
    categoryRoasted: "Café torréfié",
    categoryGreen: "Café vert",
    categoryMicroLot: "Micro-lots",
    categorySubscription: "Abonnements",
    tastesLike: "Notes de dégustation",
    aboutTheBag: "Détails du sac",
    weight: "Poids",
    roast: "Torréfaction",
    otherCoffee: "Autre café de cette récolte",
    shopBreadcrumb: "Boutique",
    rotateLots: "Lots tournants",
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
  // Nav / header
  shop: string;
  ourStory: string;
  traceABag: string;
  myOrder: string;
  // Shop page
  shopHeading: string;
  shopLead: string;
  allCoffee: string;
  // Category labels
  categoryRoasted: string;
  categoryGreen: string;
  categoryMicroLot: string;
  categorySubscription: string;
  // Product page labels
  tastesLike: string;
  aboutTheBag: string;
  weight: string;
  roast: string;
  otherCoffee: string;
  shopBreadcrumb: string;
  rotateLots: string;
  // Actions
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
