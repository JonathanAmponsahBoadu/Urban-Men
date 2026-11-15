import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createStore, useStore } from "@/lib/storage";
import { palettes, type Palette, type Scheme } from "@/theme/colors";

export const schemeStore = createStore<Scheme>("um.theme", "dark");

type ThemeValue = { scheme: Scheme; colors: Palette; toggle: () => void };
const Ctx = createContext<ThemeValue>({ scheme: "dark", colors: palettes.dark, toggle: () => undefined });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useStore(schemeStore);
  const value = useMemo<ThemeValue>(
    () => ({ scheme, colors: palettes[scheme], toggle: () => schemeStore.set(scheme === "dark" ? "light" : "dark") }),
    [scheme],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
