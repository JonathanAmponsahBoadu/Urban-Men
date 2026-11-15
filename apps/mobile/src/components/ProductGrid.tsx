import { useWindowDimensions, View } from "react-native";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/data/products";

export const PAGE_PADDING = 16;
const GAP = 14;

/** Width of one card in a two-column grid (three on wide screens such as tablets). */
export function useCardWidth() {
  const { width } = useWindowDimensions();
  const cols = width >= 700 ? 3 : 2;
  return { cols, width: Math.floor((width - PAGE_PADDING * 2 - GAP * (cols - 1)) / cols), gap: GAP };
}

/** Non-scrolling grid, for use inside a ScrollView. */
export function ProductGrid({ products }: { products: Product[] }) {
  const { width, gap } = useCardWidth();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: gap, rowGap: 22 }}>
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} width={width} />
      ))}
    </View>
  );
}
