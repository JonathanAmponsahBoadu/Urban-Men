// PLACEHOLDER size chart: typical regular-fit shirt garment measurements in cm.
// Replace with Urban Men's real measurements before launch.
import type { Size } from "@/lib/types";

export const sizeChart: { size: Size; chest: number; shoulder: number; sleeve: number; length: number }[] = [
  { size: "S", chest: 100, shoulder: 45, sleeve: 62, length: 72 },
  { size: "M", chest: 106, shoulder: 47, sleeve: 63, length: 74 },
  { size: "L", chest: 112, shoulder: 49, sleeve: 64, length: 76 },
  { size: "XL", chest: 118, shoulder: 51, sleeve: 65, length: 78 },
  { size: "XXL", chest: 124, shoulder: 53, sleeve: 66, length: 80 },
];

export const measuringTips = [
  { part: "Chest", how: "Measure around the fullest part of your chest, under the arms, keeping the tape level." },
  { part: "Shoulder", how: "Measure straight across the back from one shoulder edge to the other." },
  { part: "Sleeve", how: "From the shoulder edge down to the wrist bone, with your arm slightly bent." },
  { part: "Length", how: "From the base of the collar at the back down to where you want the hem to fall." },
];

/** Suggests a size from a body chest measurement (cm), allowing about 8 cm of ease. PLACEHOLDER rule. */
export function recommendSize(chest?: number): Size | undefined {
  if (!chest || chest < 60) return undefined;
  const target = chest + 8;
  return sizeChart.find((r) => r.chest >= target)?.size ?? "XXL";
}
