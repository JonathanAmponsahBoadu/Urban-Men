import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Product } from "@/data/products";
import { displayName, formatPrice, isPreorder, orderable } from "@/lib/format";
import { toggleWishlist, wishlistStore } from "@/lib/stores";
import { useStore } from "@/lib/storage";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

/** A shirt in the shop grid. Tap to open the product; the heart saves it to the wishlist. */
export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const { colors } = useTheme();
  const wishlist = useStore(wishlistStore);
  const liked = wishlist.includes(product.slug);
  const pre = isPreorder(product);
  const sold = !orderable(product);
  const name = displayName(product);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: product.slug } })}
      accessibilityRole="button"
      accessibilityLabel={`View ${name}, ${formatPrice(product.price) ?? "ask for price"}`}
      style={{ width }}
    >
      <View style={[styles.photo, { backgroundColor: colors.surface }]}>
        <Image source={product.images[0].src} contentFit="cover" style={[StyleSheet.absoluteFill, sold && { opacity: 0.55 }]} transition={150} />
        <View style={[styles.tag, { backgroundColor: colors.bg + "d9" }]}>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 9, letterSpacing: 1.4, color: colors.accent, textTransform: "uppercase" }}>{product.sleeve}</Text>
        </View>
        {(pre || sold || product.badge) && (
          <View style={[styles.bottomTag, { backgroundColor: sold ? colors.text : colors.accent }]}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: sold ? colors.bg : colors.onAccent, textTransform: "uppercase", letterSpacing: 1 }}>
              {sold ? "Sold out" : pre ? "Pre-order" : product.badge}
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => toggleWishlist(product.slug)}
          accessibilityRole="button"
          accessibilityLabel={liked ? `Remove ${name} from wishlist` : `Save ${name} to wishlist`}
          hitSlop={6}
          style={[styles.heart, { backgroundColor: colors.bg + "d9" }]}
        >
          <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? colors.accent : colors.text} />
        </Pressable>
      </View>
      <Text numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 19, color: colors.text, marginTop: 10 }}>
        {name}
        {product.localMeaning ? <Text style={{ fontFamily: fonts.displayItalic, fontSize: 12, color: colors.muted }}>{`  “${product.localMeaning}”`}</Text> : null}
      </Text>
      <Text numberOfLines={2} style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2, minHeight: 34 }}>
        {product.note}
      </Text>
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.accent, marginTop: 4 }}>{formatPrice(product.price) ?? "Ask for price"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: { aspectRatio: 4 / 5, borderRadius: 14, overflow: "hidden" },
  tag: { position: "absolute", left: 8, top: 8, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  bottomTag: { position: "absolute", left: 8, bottom: 8, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  heart: { position: "absolute", right: 8, top: 8, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
