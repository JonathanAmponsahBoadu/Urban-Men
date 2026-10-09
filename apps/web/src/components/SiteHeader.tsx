"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BagIcon,
  ChevronIcon,
  CloseIcon,
  GearIcon,
  HeartIcon,
  InboxIcon,
  LogoutIcon,
  MenuIcon,
  PackageIcon,
  ScissorsIcon,
  SearchIcon,
  ShieldIcon,
  ShopIcon,
  StarOutlineIcon,
  TicketIcon,
  UserIcon,
} from "@/components/icons";
import { whatsappUrl } from "@/data/site";
import { useHydrated, useStore } from "@/lib/storage";
import { cartStore, inboxStore, signOut, useCurrentUser, wishlistStore } from "@/lib/stores";

const browseLinks = [
  { href: "/shop", label: "All shirts" },
  { href: "/shop?sleeve=Long%20sleeve", label: "Long sleeve" },
  { href: "/shop?sleeve=Short%20sleeve", label: "Short sleeve" },
];
const colourLinks = ["White", "Cream", "Black", "Navy", "Blue", "Charcoal"];

function Badge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-bold text-navy">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const cart = useStore(cartStore);
  const wishlist = useStore(wishlistStore);
  const inbox = useStore(inboxStore);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cartCount = hydrated ? cart.reduce((n, i) => n + i.qty, 0) : 0;
  const wishCount = hydrated ? wishlist.length : 0;
  const unread = hydrated && user ? inbox.filter((m) => m.userId === user.id && !m.read).length : 0;

  // close the account menu on outside click / Escape
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  // lock page scroll + Escape while the drawer is open
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawer]);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setDrawer(false);
  };

  const closeAll = () => {
    setMenu(false);
    setDrawer(false);
  };

  const accountLinks = [
    { href: "/account/orders", label: "Orders", icon: <PackageIcon /> },
    { href: "/account/inbox", label: "Inbox", icon: <InboxIcon />, badge: unread },
    { href: "/account/reviews", label: "Ratings & reviews", icon: <StarOutlineIcon /> },
    { href: "/cart", label: "Cart", icon: <BagIcon className="h-5 w-5" />, badge: cartCount },
    { href: "/account/vouchers", label: "Vouchers", icon: <TicketIcon /> },
    { href: "/account/wishlist", label: "Wishlist", icon: <HeartIcon className="h-5 w-5" />, badge: wishCount },
    { href: "/account/requests", label: "My style requests", icon: <ScissorsIcon /> },
    { href: "/account/addresses", label: "Addresses & MoMo", icon: <PackageIcon /> },
    { href: "/account/measurements", label: "My measurements", icon: <ScissorsIcon /> },
    { href: "/account/settings", label: "Settings", icon: <GearIcon /> },
  ];

  const searchForm = (
    <form onSubmit={onSearch} role="search" className="relative w-full">
      <label htmlFor="site-search" className="sr-only">Search shirts</label>
      <input
        id="site-search"
        name="q"
        type="search"
        placeholder="Search shirts, colours, prints…"
        className="w-full rounded-full border border-white/15 bg-navy-deep py-2.5 pl-5 pr-12 text-sm text-ivory placeholder:text-mist/70 focus:border-gold focus:outline-none"
      />
      <button type="submit" aria-label="Search" className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-navy">
        <SearchIcon className="h-4 w-4" />
      </button>
    </form>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:gap-6 md:px-10">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            aria-expanded={drawer}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
          >
            <MenuIcon />
          </button>

          <Link href="/" aria-label="Urban Men Apparel home" className="flex shrink-0 items-center gap-3">
            <Image src="/brand/logo-monogram-gold.png" alt="" width={896} height={1011} className="h-10 w-auto" />
            <span className="hidden font-display text-lg tracking-[0.2em] lg:block">URBAN MEN</span>
          </Link>

          <div className="mx-auto hidden w-full max-w-xl md:block">{searchForm}</div>
          <div className="ml-auto md:ml-0" />

          <div className="flex items-center gap-1 md:gap-2">
            {/* account */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menu}
                className="relative flex h-10 items-center gap-2 rounded-full px-3 hover:bg-white/10"
              >
                <UserIcon className="h-6 w-6" />
                <span className="hidden text-sm md:inline">
                  {hydrated && user ? `Hi, ${user.name.split(" ")[0]}` : "Account"}
                </span>
                <ChevronIcon className="hidden h-3.5 w-3.5 md:block" />
                {unread > 0 && <Badge n={unread} />}
              </button>

              {menu && (
                <div role="menu" className="absolute right-0 top-12 w-72 overflow-hidden rounded-xl border border-white/10 bg-navy-soft shadow-2xl">
                  {user ? (
                    <>
                      <div className="border-b border-white/10 px-5 py-4">
                        <p className="font-semibold">{user.name}</p>
                        <p className="truncate text-sm text-mist">{user.email}</p>
                      </div>
                      <div className="py-2">
                        {accountLinks.map((l) => (
                          <Link key={l.href} href={l.href} onClick={closeAll} role="menuitem" className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-white/5">
                            <span className="text-gold">{l.icon}</span>
                            <span className="flex-1">{l.label}</span>
                            {l.badge ? <span className="rounded-full bg-gold px-2 text-xs font-bold text-navy">{l.badge}</span> : null}
                          </Link>
                        ))}
                        {user.role === "admin" && (
                          <Link href="/admin" onClick={closeAll} role="menuitem" className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-white/5">
                            <span className="text-gold"><ShieldIcon /></span>
                            <span className="flex-1">Admin dashboard</span>
                          </Link>
                        )}
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          signOut();
                          closeAll();
                          router.push("/");
                        }}
                        className="flex w-full items-center gap-3 border-t border-white/10 px-5 py-3 text-left text-sm hover:bg-white/5"
                      >
                        <span className="text-gold"><LogoutIcon /></span> Log out
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3 p-5">
                      <p className="text-sm text-mist">Sign in to track orders, save a wishlist and leave reviews.</p>
                      <Link href="/login" onClick={closeAll} className="block rounded-full bg-gold py-2.5 text-center text-sm font-semibold uppercase tracking-widest text-navy">
                        Sign in
                      </Link>
                      <Link href="/signup" onClick={closeAll} className="block rounded-full border border-gold/60 py-2.5 text-center text-sm font-semibold uppercase tracking-widest text-gold">
                        Create account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/shop" aria-label="Shop all apparels" title="Shop" className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
              <ShopIcon />
            </Link>
            <Link href="/account/wishlist" aria-label={`Wishlist, ${wishCount} saved`} className="relative hidden h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 sm:flex">
              <HeartIcon />
              <Badge n={wishCount} />
            </Link>
            <Link href="/cart" aria-label={`Cart, ${cartCount} items`} className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
              <BagIcon />
              <Badge n={cartCount} />
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">{searchForm}</div>
      </header>

      {/* menu drawer */}
      <div className={`fixed inset-0 z-60 ${drawer ? "" : "pointer-events-none"}`} aria-hidden={!drawer}>
        <div onClick={() => setDrawer(false)} className={`absolute inset-0 bg-black/60 transition-opacity ${drawer ? "opacity-100" : "opacity-0"}`} />
        <aside
          aria-label="Menu"
          className={`absolute inset-y-0 left-0 no-scrollbar flex w-[85%] max-w-sm flex-col overflow-y-auto bg-navy-deep shadow-2xl transition-transform duration-300 ${drawer ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <Image src="/brand/logo-wordmark-gold.png" alt="Urban Men Apparel" width={1600} height={962} className="h-14 w-auto" />
            <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
              <CloseIcon />
            </button>
          </div>

          <nav className="flex-1 px-5 py-6" aria-label="Site">
            <ul className="space-y-1">
              <li><Link href="/" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Home</Link></li>
            </ul>

            <p className="mb-2 mt-6 px-3 text-xs uppercase tracking-[0.3em] text-gold">Shop</p>
            <ul className="space-y-1">
              {browseLinks.map((l) => (
                <li key={l.href}><Link href={l.href} onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">{l.label}</Link></li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 px-3">
              {colourLinks.map((c) => (
                <Link key={c} href={`/shop?colour=${c}`} onClick={closeAll} className="rounded-full border border-white/15 px-3 py-1 text-sm text-mist hover:border-gold hover:text-gold">
                  {c}
                </Link>
              ))}
            </div>

            <p className="mb-2 mt-8 px-3 text-xs uppercase tracking-[0.3em] text-gold">Made for you</p>
            <ul className="space-y-1">
              <li><Link href="/custom-style" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Request a custom style</Link></li>
              <li><Link href="/size-guide" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Size guide</Link></li>
            </ul>

            <p className="mb-2 mt-8 px-3 text-xs uppercase tracking-[0.3em] text-gold">More</p>
            <ul className="space-y-1">
              <li><Link href="/lookbook" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Lookbook</Link></li>
              <li><Link href="/about" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">About us</Link></li>
              <li><Link href="/track" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Track your order</Link></li>
              <li><Link href="/faq" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">FAQ</Link></li>
              <li><Link href="/#why-us" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Why Urban Men</Link></li>
              <li><Link href="/#app" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Get the app</Link></li>
              <li><Link href="/#contact" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Contact us</Link></li>
            </ul>

            {user && (
              <>
                <p className="mb-2 mt-8 px-3 text-xs uppercase tracking-[0.3em] text-gold">My account</p>
                <ul className="space-y-1">
                  {accountLinks.map((l) => (
                    <li key={l.href}><Link href={l.href} onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">{l.label}</Link></li>
                  ))}
                  {user.role === "admin" && (
                    <li><Link href="/admin" onClick={closeAll} className="block rounded-lg px-3 py-2.5 hover:bg-white/5">Admin dashboard</Link></li>
                  )}
                </ul>
              </>
            )}
          </nav>

          <div className="space-y-3 border-t border-white/10 p-5">
            {!user && (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={closeAll} className="rounded-full bg-gold py-2.5 text-center text-sm font-semibold uppercase tracking-widest text-navy">Sign in</Link>
                <Link href="/signup" onClick={closeAll} className="rounded-full border border-gold/60 py-2.5 text-center text-sm font-semibold uppercase tracking-widest text-gold">Sign up</Link>
              </div>
            )}
            <a href={whatsappUrl("Hello Urban Men, I would like to place an order.")} className="block rounded-full border border-white/20 py-2.5 text-center text-sm hover:border-gold hover:text-gold">
              Chat on WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
