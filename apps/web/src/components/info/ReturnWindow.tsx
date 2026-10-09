"use client";

import { useSiteSettings } from "@/lib/settings";

export function ReturnWindow() {
  const { returnWindowDays } = useSiteSettings();
  return <>{returnWindowDays} days</>;
}
