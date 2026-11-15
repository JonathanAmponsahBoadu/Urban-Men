import { router } from "expo-router";
import { ScrollView, View } from "react-native";
import { PAGE_PADDING, ProductGrid } from "@/components/ProductGrid";
import { Body, Button, Display } from "@/components/ui";
import { products } from "@/data/products";
import { useStore } from "@/lib/storage";
import { wishlistStore } from "@/lib/stores";

export default function Wishlist() {
  const slugs = useStore(wishlistStore);
  const saved = slugs.flatMap((s) => products.find((p) => p.slug === s) ?? []);

  if (saved.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
        <Display style={{ textAlign: "center" }}>Nothing saved yet</Display>
        <Body muted style={{ textAlign: "center" }}>Tap the heart on any shirt to save it here.</Body>
        <Button label="Browse the collection" onPress={() => router.replace("/shop")} />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40 }}>
      <ProductGrid products={saved} />
    </ScrollView>
  );
}
