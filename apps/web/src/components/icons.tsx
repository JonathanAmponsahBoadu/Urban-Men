type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const MenuIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const CloseIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const SearchIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
);
export const UserIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-3.6 4.4-5.5 8-5.5s6.5 1.9 8 5.5" /></svg>
);
export const HeartIcon = ({ className = "h-6 w-6", filled = false }: P & { filled?: boolean }) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7-4.4-9-9.2C1.8 7.7 3.7 5 6.6 5c1.9 0 3.5 1 5.4 3.1C13.9 6 15.5 5 17.4 5c2.9 0 4.8 2.7 3.6 5.8C19 15.6 12 20 12 20z" />
  </svg>
);
export const BagIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);
export const ChevronIcon = ({ className = "h-4 w-4", dir = "down" }: P & { dir?: "down" | "left" | "right" }) => (
  <svg {...base} className={`${className} ${dir === "left" ? "rotate-90" : dir === "right" ? "-rotate-90" : ""}`}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const WhatsAppIcon = ({ className = "h-6 w-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-1.5-.7-2.4-1.3-3.4-2.9-.3-.4.3-.4.8-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1 1.7-.9 2.7.2 1.2.8 2.2 1.6 3.1 1.5 1.8 3.4 2.9 5.6 3.4.8.2 1.5.2 2-.1.6-.3 1.2-1 1.4-1.7.1-.2 0-.3-.1-.4z" />
  </svg>
);
export const InboxIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M3 12l3-7h12l3 7v7H3z" /><path d="M3 12h5l1.5 2.5h5L16 12h5" /></svg>
);
export const PackageIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></svg>
);
export const StarOutlineIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.3l1.1-6.2L3 9.7l6.2-.9z" /></svg>
);
export const TicketIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z" /><path d="M14 6v12" strokeDasharray="2 3" /></svg>
);
export const GearIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" /></svg>
);
export const LogoutIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M10 4H5v16h5" /><path d="M15 8l4 4-4 4M19 12H9" /></svg>
);
export const ScissorsIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5L20 18M8 16.5L20 6" /></svg>
);
export const ShieldIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" /></svg>
);
export const ShopIcon = ({ className = "h-6 w-6" }: P) => (
  <svg {...base} className={className}>
    <path d="M4 9.5 5.5 4h13L20 9.5" />
    <path d="M4 9.5c0 1.4 1.1 2.5 2.5 2.5S9 10.9 9 9.5c0 1.4 1.1 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.1 2.5 2.5 2.5S20 10.9 20 9.5" />
    <path d="M5.5 12v8h13v-8M10 20v-4.5h4V20" />
  </svg>
);
