export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];
export type StockBySize = Record<Size, number>;

export type Role = "shopper" | "admin";

export type Measurements = { chest?: number; shoulder?: number; sleeve?: number; length?: number; waist?: number };

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  region: string;
  address: string;
  /** Ghana Post GPS digital address, e.g. GA-123-4567 */
  gps?: string;
};

export type SavedMomo = { id: string; network: "MTN MoMo" | "Telecel Cash" | "AT Money"; phone: string };

export const STAFF_ROLES = ["owner", "manager", "support"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: Role;
  /** admin users only */
  staffRole?: StaffRole;
  measurements?: Measurements;
  addresses?: Address[];
  momoNumbers?: SavedMomo[];
  createdAt: string;
};

export const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Western North", "Central", "Eastern", "Volta", "Oti",
  "Northern", "Savannah", "North East", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo",
] as const;

export type CartItem = { slug: string; size: Size; qty: number };

export const ORDER_STATUSES = [
  "Awaiting confirmation",
  "Confirmed",
  "In production",
  "Out for delivery",
  "Delivered",
  "Cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderLine = { slug: string; name: string; size: Size; qty: number; price?: number; image: string };

export const MOMO_NETWORKS = ["MTN MoMo", "Telecel Cash", "AT Money"] as const;
export type MomoNetwork = (typeof MOMO_NETWORKS)[number];

export type Payment = {
  method: "momo" | "whatsapp";
  network?: MomoNetwork;
  phone?: string;
  /** true while payments are not connected: nothing was actually charged */
  demo?: boolean;
};

export type Delivery = {
  name: string;
  phone: string;
  /** guests also give an email so we can reach them */
  email?: string;
  region?: string;
  /** Ghana Post GPS digital address */
  gps?: string;
  address: string;
  notes?: string;
  /** trouser size or waist, only when it differs from the shirt size */
  trouserNote?: string;
  updatesByEmail: boolean;
  updatesBySms: boolean;
};

export type Order = {
  id: string;
  userId: string;
  createdAt: string;
  lines: OrderLine[];
  status: OrderStatus;
  /** GH₵, only when every line had a price */
  total?: number;
  voucher?: string;
  discount?: number;
  payment?: Payment;
  delivery?: Delivery;
};

export type Review = {
  id: string;
  slug: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
};

export type InboxMessage = {
  id: string;
  userId: string;
  from: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export const REQUEST_STATUSES = ["New", "Reviewing", "Quoted", "Accepted", "Declined"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export type RequestMessage = { from: "customer" | "admin"; text: string; at: string };

export type StyleRequest = {
  id: string;
  thread: RequestMessage[];
  userId: string;
  userName: string;
  contact: string;
  description: string;
  images: string[];
  colour?: string;
  budget?: string;
  measurements?: string;
  status: RequestStatus;
  adminNote?: string;
  createdAt: string;
};

export type Voucher = {
  id: string;
  code: string;
  percentOff: number;
  note?: string;
  active: boolean;
};

export type Subscriber = { id: string; email: string; createdAt: string };

export type ContactMessage = {
  id: string;
  name: string;
  contact: string;
  message: string;
  createdAt: string;
  handled: boolean;
};

export type NotifyRequest = { id: string; slug: string; size?: Size; contact: string; createdAt: string };

export const RETURN_STATUSES = ["New", "Approved", "Declined", "Completed"] as const;
export type ReturnStatus = (typeof RETURN_STATUSES)[number];
export type ReturnRequest = {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  type: "Return" | "Exchange";
  reason: string;
  details?: string;
  wantedSize?: Size;
  status: ReturnStatus;
  createdAt: string;
};

export type ActivityEntry = { id: string; at: string; who: string; action: string };

/** A staff login. PREVIEW ONLY: stored in this browser with a salted hash. */
export type StaffAccount = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  salt: string;
  hash: string;
  createdAt: string;
};
