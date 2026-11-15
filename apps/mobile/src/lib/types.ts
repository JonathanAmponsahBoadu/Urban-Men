export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];
export type StockBySize = Record<Size, number>;

export type CartItem = { slug: string; size: Size; qty: number };

export const ORDER_STATUSES = ["Awaiting confirmation", "Confirmed", "In production", "Out for delivery", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const MOMO_NETWORKS = ["MTN MoMo", "Telecel Cash", "AT Money"] as const;
export type MomoNetwork = (typeof MOMO_NETWORKS)[number];

export const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Western North", "Central", "Eastern", "Volta", "Oti",
  "Northern", "Savannah", "North East", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
] as const;

export type OrderLine = { slug: string; name: string; size: Size; qty: number; price?: number; preorder?: boolean };

export type Order = {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  status: OrderStatus;
  total?: number;
  paidNow?: number;
  balance?: number;
  readyBy?: string;
  payment: { method: "momo" | "whatsapp"; network?: MomoNetwork; phone?: string; demo?: boolean };
  delivery: { name: string; phone: string; email?: string; region: string; gps?: string; address: string; notes?: string; trouserNote?: string };
};

export type User = { name: string; email: string; phone?: string; provider?: "google" };

export type StyleRequest = {
  id: string;
  description: string;
  contact: string;
  colour?: string;
  budget?: string;
  images: string[];
  status: "New" | "Reviewing" | "Quoted" | "Accepted" | "Declined";
  createdAt: string;
};
