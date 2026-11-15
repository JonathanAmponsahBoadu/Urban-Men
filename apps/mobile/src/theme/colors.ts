export type Scheme = "dark" | "light";

export type Palette = {
  bg: string;
  bgDeep: string;
  surface: string;
  accent: string;
  accentDeep: string;
  onAccent: string;
  text: string;
  muted: string;
  border: string;
  tint: string;
  danger: string;
  ok: string;
  warn: string;
};

// Same tokens as the website. Dark: navy and gold. Light: ivory and ink with a deep crimson accent.
export const palettes: Record<Scheme, Palette> = {
  dark: {
    bg: "#1b2231",
    bgDeep: "#131925",
    surface: "#252e42",
    accent: "#e8b83a",
    accentDeep: "#c9971f",
    onAccent: "#1b2231",
    text: "#f5f1e8",
    muted: "#aab2c3",
    border: "rgba(255,255,255,0.14)",
    tint: "rgba(255,255,255,0.08)",
    danger: "#fca5a5",
    ok: "#6ee7b7",
    warn: "#fcd34d",
  },
  light: {
    bg: "#f8f4ec",
    bgDeep: "#efe8da",
    surface: "#ffffff",
    accent: "#a3262a",
    accentDeep: "#84191d",
    onAccent: "#f8f4ec",
    text: "#14213d",
    muted: "#4c586f",
    border: "rgba(20,33,61,0.16)",
    tint: "rgba(20,33,61,0.07)",
    danger: "#b91c1c",
    ok: "#047857",
    warn: "#b45309",
  },
};

export const fonts = {
  display: "BodoniModa_400Regular",
  displayItalic: "BodoniModa_400Regular_Italic",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodyBold: "DMSans_700Bold",
};
