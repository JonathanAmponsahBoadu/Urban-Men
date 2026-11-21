// Size chart: garment measurements in cm for Urban Men's regular-fit shirts.
// Update these with real garment measurements before launch if they differ.
import type { Size } from "@/lib/types";

export const sizeChart: { size: Size; chest: number; shoulder: number; sleeve: number; length: number }[] = [
  { size: "L", chest: 112, shoulder: 49, sleeve: 64, length: 76 },
  { size: "XL", chest: 118, shoulder: 51, sleeve: 65, length: 78 },
  { size: "2XL", chest: 124, shoulder: 53, sleeve: 66, length: 80 },
  { size: "3XL", chest: 130, shoulder: 55, sleeve: 67, length: 82 },
];

export const measuringTips = [
  { part: "Chest", how: "Measure around the fullest part of your chest, under the arms, keeping the tape level." },
  { part: "Shoulder", how: "Measure straight across the back from one shoulder edge to the other." },
  { part: "Sleeve", how: "From the shoulder edge down to the wrist bone, with your arm slightly bent." },
  { part: "Length", how: "From the base of the collar at the back down to where you want the hem to fall." },
];

/** Suggests a size from a body chest measurement (cm), allowing about 8 cm of ease. */
export function recommendSize(chest?: number): Size | undefined {
  if (!chest || chest < 60) return undefined;
  const target = chest + 8;
  return sizeChart.find((r) => r.chest >= target)?.size ?? "3XL";
}
