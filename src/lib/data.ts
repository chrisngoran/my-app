// Sample data for the demo. Every name, figure and story here is invented for
// illustration and will be replaced by the cooperative's real records.
import type { CoffeeLot, Farmer, FarmerPayment, Order, Product } from "./types";

export const cooperative = {
  name: "GREENVENTURES Cooperative Society Ltd",
  shortName: "GREENVENTURES",
  location: "Kumbo, Bui Division, North West Region, Cameroon",
  phone: "+237 681 13 99 79",
  /** WhatsApp number in international format without + or spaces. Calls go to the same number. */
  whatsapp: "237681139979",
  email: "contact@greenventure.example",
  /** The cooperative's Facebook page address. Empty hides the "Follow us" links until there is one. */
  facebook: "",
  story:
    "GREENVENTURES brings together family coffee farmers across the Bui highlands, where Arabica grows between 1,600 and 2,000 metres on volcanic soil. We collect, process and sell our members' coffee together, so every farmer gets a fair price and every cup can be traced back to the hillside it came from.",
};

export const farmers: Farmer[] = [
  {
    id: "F001",
    name: "Bernard Shey",
    village: "Tobin",
    plotHectares: 1.5,
    altitudeMetres: 1780,
    joinedYear: 2019,
    story: "Bernard took over his father's Arabica trees in 2012 and now mentors young growers in Tobin on selective picking.",
    phone: "+237 6XX XXX 101",
  },
  {
    id: "F002",
    name: "Ernestine Fonyuy",
    village: "Mbve",
    plotHectares: 0.8,
    altitudeMetres: 1850,
    joinedYear: 2020,
    story: "Ernestine dries her cherries on raised beds she built with the cooperative's first micro-grant.",
    phone: "+237 6XX XXX 102",
  },
  {
    id: "F003",
    name: "Joseph Kongnyuy",
    village: "Kikaikelaki",
    plotHectares: 2.1,
    altitudeMetres: 1720,
    joinedYear: 2018,
    story: "A founding member, Joseph runs the washing station that serves twelve neighbouring farms.",
    phone: "+237 6XX XXX 103",
  },
  {
    id: "F004",
    name: "Delphine Berinyuy",
    village: "Meluf",
    plotHectares: 1.0,
    altitudeMetres: 1900,
    joinedYear: 2021,
    story: "Delphine's high-altitude plot produces some of the cooperative's brightest, most floral lots.",
    phone: "+237 6XX XXX 104",
  },
  {
    id: "F005",
    name: "Peter Nyuydze",
    village: "Shisong",
    plotHectares: 1.3,
    altitudeMetres: 1690,
    joinedYear: 2019,
    story: "Peter intercrops coffee with beans and plantain, keeping his soil rich and his family fed year-round.",
    phone: "+237 6XX XXX 105",
  },
  {
    id: "F006",
    name: "Mary Lukong",
    village: "Mbiame",
    plotHectares: 0.6,
    altitudeMetres: 1760,
    joinedYear: 2022,
    story: "Mary is the cooperative's newest collection agent and leads the women farmers' savings group.",
    phone: "+237 6XX XXX 106",
  },
];

export const lots: CoffeeLot[] = [
  {
    code: "GV-2026-011",
    farmerIds: ["F001", "F003"],
    harvestDate: "2026-01-18",
    processingMethod: "Washed",
    variety: "Java, Jamaica Blue Mountain",
    weightKg: 640,
    quality: { moisturePercent: 11.2, screenSize: "16+", defectsPer300g: 4, cuppingScore: 84.5 },
    notes: "Clean and sweet, washed at the Kikaikelaki station and dried for 18 days.",
  },
  {
    code: "GV-2026-014",
    farmerIds: ["F004"],
    harvestDate: "2026-01-29",
    processingMethod: "Natural",
    variety: "Java",
    weightKg: 180,
    quality: { moisturePercent: 10.8, screenSize: "17+", defectsPer300g: 2, cuppingScore: 86.75 },
    notes: "Single-farm micro-lot from Meluf at 1,900 m, sun-dried in whole cherry on raised beds.",
  },
  {
    code: "GV-2026-019",
    farmerIds: ["F002", "F005", "F006"],
    harvestDate: "2026-02-10",
    processingMethod: "Honey",
    variety: "Java, Catimor",
    weightKg: 420,
    quality: { moisturePercent: 11.5, screenSize: "15+", defectsPer300g: 6, cuppingScore: 83.25 },
    notes: "Community lot blending three farms; honey-processed for a rounder, fruit-forward cup.",
  },
  {
    code: "GV-2026-022",
    farmerIds: ["F001", "F002", "F003", "F005"],
    harvestDate: "2026-02-21",
    processingMethod: "Washed",
    variety: "Java, Catimor",
    weightKg: 1200,
    quality: { moisturePercent: 11.6, screenSize: "15+", defectsPer300g: 8, cuppingScore: 82.0 },
    notes: "Our everyday house lot: balanced, chocolatey and reliable.",
  },
];

export const products: Product[] = [
  {
    slug: "bui-highlands-medium-roast",
    name: "Bui Highlands Medium Roast",
    category: "roasted",
    priceXaf: 4500,
    weightGrams: 250,
    lotCode: "GV-2026-022",
    roast: "Medium",
    cuppingNotes: ["Milk chocolate", "Roasted nuts", "Brown sugar"],
    description: "Our everyday coffee: balanced, smooth and roasted in small batches in Kumbo.",
    stock: 120,
    image: "/products/medium-roast.jpg",
  },
  {
    slug: "meluf-natural-micro-lot",
    name: "Meluf Natural Micro-lot",
    category: "micro-lot",
    priceXaf: 9500,
    weightGrams: 250,
    lotCode: "GV-2026-014",
    roast: "Light",
    cuppingNotes: ["Strawberry", "Jasmine", "Cocoa nib"],
    description: "A single-farm natural from Delphine Berinyuy's plot at 1,900 m. Limited quantity.",
    stock: 24,
    image: "/products/micro-lot.jpg",
  },
  {
    slug: "kumbo-honey-espresso",
    name: "Kumbo Honey Espresso",
    category: "roasted",
    priceXaf: 5500,
    weightGrams: 250,
    lotCode: "GV-2026-019",
    roast: "Dark",
    cuppingNotes: ["Dark cherry", "Molasses", "Cocoa"],
    description: "A rich honey-processed community lot roasted for espresso and strong morning coffee.",
    stock: 60,
    image: "/products/espresso.jpg",
  },
  {
    slug: "washed-green-coffee-1kg",
    name: "Washed Arabica Green Coffee (1 kg)",
    category: "green",
    priceXaf: 7000,
    weightGrams: 1000,
    lotCode: "GV-2026-011",
    cuppingNotes: ["Citrus", "Caramel", "Clean finish"],
    description: "Unroasted Grade 1 washed Arabica for home roasters and cafés. Larger quantities on request.",
    stock: 300,
    image: "/products/green.jpg",
  },
  {
    slug: "monthly-subscription",
    name: "Monthly Coffee Subscription",
    category: "subscription",
    priceXaf: 12000,
    weightGrams: 750,
    lotCode: "GV-2026-022",
    roast: "Medium",
    cuppingNotes: ["Rotating selection"],
    description: "Three 250 g bags every month, chosen from our freshest lots and delivered to your door.",
    stock: 50,
    image: "/products/subscription.jpg",
  },
];

export const orders: Order[] = [
  {
    id: "GV-ORD-1042",
    customerName: "Aminatou B.",
    city: "Yaoundé",
    createdAt: "2026-10-14T09:12:00Z",
    lines: [{ productSlug: "bui-highlands-medium-roast", quantity: 2, unitPriceXaf: 4500 }],
    shippingXaf: 2000,
    paymentMethod: "MTN MoMo",
    status: "Out for delivery",
  },
  {
    id: "GV-ORD-1043",
    customerName: "Lena K.",
    city: "Berlin",
    createdAt: "2026-10-14T15:40:00Z",
    lines: [
      { productSlug: "meluf-natural-micro-lot", quantity: 2, unitPriceXaf: 9500 },
      { productSlug: "kumbo-honey-espresso", quantity: 1, unitPriceXaf: 5500 },
    ],
    shippingXaf: 18000,
    paymentMethod: "Card",
    status: "Preparing",
  },
  {
    id: "GV-ORD-1044",
    customerName: "Collins T.",
    city: "Bamenda",
    createdAt: "2026-10-15T07:55:00Z",
    lines: [{ productSlug: "monthly-subscription", quantity: 1, unitPriceXaf: 12000 }],
    shippingXaf: 1000,
    paymentMethod: "Orange Money",
    status: "Paid",
  },
  {
    id: "GV-ORD-1045",
    customerName: "Café Lumière",
    city: "Douala",
    createdAt: "2026-10-15T11:20:00Z",
    lines: [{ productSlug: "washed-green-coffee-1kg", quantity: 10, unitPriceXaf: 7000 }],
    shippingXaf: 5000,
    paymentMethod: "MTN MoMo",
    status: "Pending payment",
  },
];

export const farmerPayments: FarmerPayment[] = [
  { farmerId: "F001", lotCode: "GV-2026-011", amountXaf: 310000, paidOn: "2026-03-02", method: "MTN MoMo" },
  { farmerId: "F003", lotCode: "GV-2026-011", amountXaf: 405000, paidOn: "2026-03-02", method: "MTN MoMo" },
  { farmerId: "F004", lotCode: "GV-2026-014", amountXaf: 290000, paidOn: "2026-03-10", method: "Orange Money" },
  { farmerId: "F002", lotCode: "GV-2026-019", amountXaf: 150000, paidOn: "2026-03-18", method: "Orange Money" },
  { farmerId: "F005", lotCode: "GV-2026-019", amountXaf: 175000, paidOn: "2026-03-18", method: "Cash" },
  { farmerId: "F006", lotCode: "GV-2026-019", amountXaf: 95000, paidOn: "2026-03-18", method: "MTN MoMo" },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getLot(code: string) {
  return lots.find((l) => l.code === code);
}

export function getFarmer(id: string) {
  return farmers.find((f) => f.id === id);
}

export function orderTotalXaf(order: Order) {
  return order.lines.reduce((sum, l) => sum + l.quantity * l.unitPriceXaf, 0) + order.shippingXaf;
}
