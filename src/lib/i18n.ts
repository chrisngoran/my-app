export type Lang = "en" | "fr";

export const LANGS: readonly Lang[] = ["en", "fr"];

const T = {
  en: {
    // Nav / header
    shop: "Shop",
    ourStory: "Our story",
    traceABag: "Trace a bag",
    myOrder: "My order",
    // Shop page
    shopHeading: "Coffee from the Bui highlands",
    shopLead: "Roasted coffee, a single-farm micro-lot, green coffee by the kilo for roasters and a monthly subscription. Every bag carries a lot code you can trace to the farms.",
    allCoffee: "All coffee",
    // Category labels
    categoryRoasted: "Roasted coffee",
    categoryGreen: "Green coffee",
    categoryMicroLot: "Micro-lots",
    categorySubscription: "Subscriptions",
    // Product page labels
    tastesLike: "Tastes like",
    aboutTheBag: "About the bag",
    weight: "Weight",
    roast: "Roast",
    otherCoffee: "Other coffee from this harvest",
    shopBreadcrumb: "Shop",
    rotateLots: "Rotating lots",
    // Actions
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
    // Home page
    heroHeading: "Highland Arabica from the family farms around Kumbo.",
    heroLead: "Our member families grow it on the volcanic slopes of the Bui highlands, between 1,600 and 2,000 metres. We process and sell it together, so every family earns a fair price and every bag tells you exactly where it came from.",
    shopHarvest: "Shop the harvest",
    meetFarmers: "Meet the farmers",
    fromHarvestYear: (y: number) => `From the ${y} harvest`,
    harvestOrderNote: "Order on WhatsApp or by phone. We confirm stock and the delivery fee, then you pay by MTN MoMo or Orange Money.",
    traceHeading: "Every bag is traceable",
    traceLead: "Each bag carries a QR code with its lot number. Scan it with your phone camera to see who grew your coffee, which village and altitude it came from, how it was processed and how it scored.",
    shippingHeading: (price: string) => `Delivered across Cameroon from ${price}, and shipped worldwide.`,
    cafesRoasters: "Cafés and roasters: ask us about green coffee by the bag.",
    startSubscription: "Start a subscription",
    messageOnWhatsApp: "Message on WhatsApp",
    callUs: "Call",
    whatsAppOrPhoneLabel: "WhatsApp or phone",
    emailLabel: "Email",
    whereWeAreLabel: "Where we are",
    // Our story page
    storyHeading: "A cooperative of coffee families in the Bui highlands",
    storyLead1: "Selling together earns members more than selling cherries alone to middlemen. Training in selective picking and drying lifts quality, and with it the price each farmer receives. Every lot is recorded and open for you to see.",
    fromPickingToPayment: "From picking to payment",
    step1Title: "Grown on family plots",
    step1Text: "Member families farm Arabica on plots of 0.5 to 2 hectares between 1,600 and 2,000 m, often intercropped with beans and plantain.",
    step2Title: "Hand-picked and collected",
    step2Text: "Only ripe red cherries are picked. Collection agents weigh each delivery and record it against the farmer's name and lot.",
    step3Title: "Processed at our stations",
    step3Text: "Cherries are washed, honey-processed or dried whole on raised beds, then rested and hulled to green coffee.",
    step4Title: "Graded and cupped",
    step4Text: "Each lot is checked for moisture, screen size and defects, then cupped and scored.",
    step5Title: "Roasted and packed in Kumbo",
    step5Text: "We roast in small batches and print a QR code with the lot number on every bag before it leaves the cooperative.",
    step6Title: "Farmers paid",
    step6Text: "Farmers are paid once their lot is sold, mostly by MTN MoMo or Orange Money, and each payment is recorded against the lot.",
    memberFamiliesLead: "Some of the families whose coffee is in this season's lots, from the highest farm to the lowest.",
    orderFromFarms: "Order from these farms",
    orderFromFarmsCopy: "Order direct from the cooperative, delivered across Cameroon and abroad.",
  },
  fr: {
    // Nav / header
    shop: "Boutique",
    ourStory: "Notre histoire",
    traceABag: "Tracer un sac",
    myOrder: "Ma commande",
    // Shop page
    shopHeading: "Café des hauts plateaux du Bui",
    shopLead: "Café torréfié, micro-lot d'une seule ferme, café vert au kilo et abonnement mensuel. Chaque sac porte un code de lot traçable jusqu'aux fermes.",
    allCoffee: "Tout le café",
    // Category labels
    categoryRoasted: "Café torréfié",
    categoryGreen: "Café vert",
    categoryMicroLot: "Micro-lots",
    categorySubscription: "Abonnements",
    // Product page labels
    tastesLike: "Notes de dégustation",
    aboutTheBag: "Détails du sac",
    weight: "Poids",
    roast: "Torréfaction",
    otherCoffee: "Autre café de cette récolte",
    shopBreadcrumb: "Boutique",
    rotateLots: "Lots tournants",
    // Actions
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
    // Home page
    heroHeading: "Arabica des hautes terres, des familles autour de Kumbo.",
    heroLead: "Nos familles membres le cultivent sur les pentes volcaniques du Bui, entre 1 600 et 2 000 mètres. Nous le transformons et le vendons ensemble, pour que chaque famille reçoive un prix juste et que chaque sac vous indique exactement d'où il vient.",
    shopHarvest: "Acheter la récolte",
    meetFarmers: "Rencontrer les agriculteurs",
    fromHarvestYear: (y: number) => `De la récolte ${y}`,
    harvestOrderNote: "Commandez sur WhatsApp ou par téléphone. Nous confirmons le stock et les frais de livraison, puis vous payez par MTN MoMo ou Orange Money.",
    traceHeading: "Chaque sac est traçable",
    traceLead: "Chaque sac porte un code QR avec son numéro de lot. Scannez-le avec l'appareil photo de votre téléphone pour voir qui a cultivé votre café, de quel village il vient, comment il a été traité et comment il a été noté.",
    shippingHeading: (price: string) => `Livré dans tout le Cameroun à partir de ${price}, et expédié dans le monde entier.`,
    cafesRoasters: "Cafés et torréfacteurs : renseignez-vous sur le café vert au sac.",
    startSubscription: "Démarrer un abonnement",
    messageOnWhatsApp: "Écrire sur WhatsApp",
    callUs: "Appeler",
    whatsAppOrPhoneLabel: "WhatsApp ou téléphone",
    emailLabel: "E-mail",
    whereWeAreLabel: "Où nous sommes",
    // Our story page
    storyHeading: "Une coopérative de familles caféicoles dans le Bui",
    storyLead1: "Vendre ensemble permet aux membres de gagner davantage qu'en vendant les cerises à des intermédiaires. La formation à la cueillette sélective et au séchage améliore la qualité, et donc le prix reçu par chaque agriculteur. Chaque lot est enregistré et vous est accessible.",
    fromPickingToPayment: "De la cueillette au paiement",
    step1Title: "Cultivé sur des parcelles familiales",
    step1Text: "Les familles membres cultivent l'Arabica sur des parcelles de 0,5 à 2 hectares entre 1 600 et 2 000 m, souvent en association avec des haricots et des plantains.",
    step2Title: "Cueillette manuelle et collecte",
    step2Text: "Seules les cerises rouges mûres sont cueillies. Les agents de collecte pèsent chaque livraison et l'enregistrent au nom de l'agriculteur et du lot.",
    step3Title: "Traitement dans nos stations",
    step3Text: "Les cerises sont lavées, traitées au miel ou séchées entières sur des lits surélevés, puis mises à reposer et décortiquées en café vert.",
    step4Title: "Calibré et dégusté",
    step4Text: "Chaque lot est contrôlé pour l'humidité, la taille et les défauts, puis dégusté et noté.",
    step5Title: "Torréfié et emballé à Kumbo",
    step5Text: "Nous torréfions en petits lots et imprimons un code QR avec le numéro du lot sur chaque sac avant qu'il ne quitte la coopérative.",
    step6Title: "Agriculteurs payés",
    step6Text: "Les agriculteurs sont payés une fois leur lot vendu, principalement par MTN MoMo ou Orange Money, et chaque paiement est enregistré.",
    memberFamiliesLead: "Certaines des familles dont le café se trouve dans les lots de cette saison, de la ferme la plus haute à la plus basse.",
    orderFromFarms: "Commander depuis ces fermes",
    orderFromFarmsCopy: "Commandez directement à la coopérative, livré dans tout le Cameroun et à l'étranger.",
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
  // Home page
  heroHeading: string;
  heroLead: string;
  shopHarvest: string;
  meetFarmers: string;
  fromHarvestYear: (y: number) => string;
  harvestOrderNote: string;
  traceHeading: string;
  traceLead: string;
  shippingHeading: (price: string) => string;
  cafesRoasters: string;
  startSubscription: string;
  messageOnWhatsApp: string;
  callUs: string;
  whatsAppOrPhoneLabel: string;
  emailLabel: string;
  whereWeAreLabel: string;
  // Our story page
  storyHeading: string;
  storyLead1: string;
  fromPickingToPayment: string;
  step1Title: string;
  step1Text: string;
  step2Title: string;
  step2Text: string;
  step3Title: string;
  step3Text: string;
  step4Title: string;
  step4Text: string;
  step5Title: string;
  step5Text: string;
  step6Title: string;
  step6Text: string;
  memberFamiliesLead: string;
  orderFromFarms: string;
  orderFromFarmsCopy: string;
}

export function getT(lang: Lang): Translations {
  return T[lang] as Translations;
}
