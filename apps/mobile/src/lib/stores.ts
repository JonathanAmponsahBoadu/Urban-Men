import type { Product } from "@/data/products";
import { site } from "@/data/site";
import { fullName, isPreorder, paymentSplit } from "@/lib/format";
import { createStore } from "@/lib/storage";
import type { CartItem, Order, OrderLine, Size, StyleRequest, User } from "@/lib/types";

export const cartStore = createStore<CartItem[]>("um.cart", []);
export const wishlistStore = createStore<string[]>("um.wishlist", []);
export const ordersStore = createStore<Order[]>("um.orders", []);
export const userStore = createStore<User | null>("um.user", null);
export const requestsStore = createStore<StyleRequest[]>("um.requests", []);

export const allStores = [cartStore, wishlistStore, ordersStore, userStore, requestsStore];

export function addToCart(slug: string, size: Size, qty = 1) {
  cartStore.update((items) => {
    const found = items.find((i) => i.slug === slug && i.size === size);
    if (found) return items.map((i) => (i === found ? { ...i, qty: i.qty + qty } : i));
    return [...items, { slug, size, qty }];
  });
}

export function setCartQty(slug: string, size: Size, qty: number) {
  cartStore.update((items) =>
    qty <= 0 ? items.filter((i) => !(i.slug === slug && i.size === size)) : items.map((i) => (i.slug === slug && i.size === size ? { ...i, qty } : i)),
  );
}

export function toggleWishlist(slug: string) {
  wishlistStore.update((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]));
}

/** Demo checkout: saves the order on this phone only. The backend will create real orders and take real payments. */
export function placeOrder(
  lines: { product: Product; size: Size; qty: number }[],
  delivery: Order["delivery"],
  payment: Order["payment"],
): Order {
  const orderLines: OrderLine[] = lines.map(({ product, size, qty }) => ({
    slug: product.slug,
    name: fullName(product),
    size,
    qty,
    price: product.price,
    ...(isPreorder(product) ? { preorder: true } : {}),
  }));
  const split = paymentSplit(orderLines, site.preorderDepositPercent);
  const readyBy =
    [...new Set(lines.flatMap((l) => (isPreorder(l.product) && l.product.preorder?.readyBy ? [l.product.preorder.readyBy] : [])))].join(" / ") ||
    undefined;
  const order: Order = {
    id: `UM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    createdAt: new Date().toISOString(),
    lines: orderLines,
    status: "Awaiting confirmation",
    total: split?.total,
    ...(split?.hasPreorder ? { paidNow: split.dueNow, balance: split.balance, readyBy } : {}),
    payment,
    delivery,
  };
  ordersStore.update((list) => [order, ...list]);
  cartStore.set([]);
  return order;
}

export function submitStyleRequest(data: Omit<StyleRequest, "id" | "status" | "createdAt">) {
  const req: StyleRequest = {
    ...data,
    id: `SR-${Date.now().toString(36).toUpperCase().slice(-5)}`,
    status: "New",
    createdAt: new Date().toISOString(),
  };
  requestsStore.update((list) => [req, ...list]);
  return req;
}
