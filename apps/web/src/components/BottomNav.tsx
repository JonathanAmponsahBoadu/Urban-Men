"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from "@/components/icons";
import { useHydrated, useStore } from "@/lib/storage";
import { cartStore, useCurrentUser, wishlistStore } from "@/lib/stores";

const HomeIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d="M4 11l8-7 8 7v9H4z" /><path d="M10 20v-6h4v6" />
  </svg>
);

/** Phone-only bottom navigation, like a shopping app. Hidden in admin and checkout. */
export function BottomNav() {
  const path = usePathname();
  const hydrated = useHydrated();
  const cart = useStore(cartStore);
  const wishlist = useStore(wishlistStore);
  const user = useCurrentUser();
  if (path.startsWith("/admin") || path.startsWith("/checkout")) return null;

  const cartCount = hydrated ? cart.reduce((n, i) => n + i.qty, 0) : 0;
  const items = [
    { href: "/", label: "Home", icon: <HomeIcon />, active: path === "/" },
    { href: "/shop", label: "Shop", icon: <SearchIcon className="h-6 w-6" />, active: path.startsWith("/shop") },
    { href: "/account/wishlist", label: "Wishlist", icon: <HeartIcon />, active: path.startsWith("/account/wishlist"), badge: hydrated ? wishlist.length : 0 },
    { href: "/cart", label: "Cart", icon: <BagIcon />, active: path === "/cart", badge: cartCount },
    { href: user ? "/account" : "/login", label: user ? "Account" : "Sign in", icon: <UserIcon />, active: path === "/account" || path === "/login" },
  ];
  return (
    <nav aria-label="Quick links" className="fixed inset-x-0 bottom-0 z-58 border-t border-white/10 bg-navy-deep/95 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {items.map((i) => (
          <li key={i.label}>
            <Link href={i.href} aria-current={i.active ? "page" : undefined} className={`relative flex flex-col items-center gap-0.5 py-2 text-[0.65rem] ${i.active ? "text-gold" : "text-mist"}`}>
              <span className="relative">
                {i.icon}
                {i.badge ? <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-navy">{i.badge}</span> : null}
              </span>
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
