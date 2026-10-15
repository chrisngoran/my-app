export type Currency = "XAF" | "EUR" | "USD";

export type ProcessingMethod = "Washed" | "Natural" | "Honey";

export type ProductCategory = "roasted" | "green" | "micro-lot" | "subscription";

export interface Farmer {
  id: string;
  name: string;
  village: string;
  /** Hectares under coffee */
  plotHectares: number;
  altitudeMetres: number;
  joinedYear: number;
  story: string;
  phone: string;
}

export interface QualityRecord {
  moisturePercent: number;
  screenSize: string;
  defectsPer300g: number;
  cuppingScore: number;
}

export interface CoffeeLot {
  /** Traceability code printed as a QR on the packaging, e.g. GV-2026-014 */
  code: string;
  farmerIds: string[];
  harvestDate: string; // ISO date
  processingMethod: ProcessingMethod;
  variety: string;
  weightKg: number;
  quality: QualityRecord;
  notes: string;
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  /** Price in FCFA (XAF); other currencies are converted for display only */
  priceXaf: number;
  weightGrams: number;
  lotCode: string;
  roast?: "Light" | "Medium" | "Dark";
  cuppingNotes: string[];
  description: string;
  stock: number;
  image: string; // path under /public
}

export type OrderStatus = "Pending payment" | "Paid" | "Preparing" | "Out for delivery" | "Delivered";

export type PaymentMethod = "MTN MoMo" | "Orange Money" | "Card";

export interface OrderLine {
  productSlug: string;
  quantity: number;
  unitPriceXaf: number;
}

export interface Order {
  id: string;
  customerName: string;
  city: string;
  createdAt: string; // ISO date-time
  lines: OrderLine[];
  shippingXaf: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface FarmerPayment {
  farmerId: string;
  lotCode: string;
  amountXaf: number;
  paidOn: string; // ISO date
  method: "MTN MoMo" | "Orange Money" | "Cash";
}
