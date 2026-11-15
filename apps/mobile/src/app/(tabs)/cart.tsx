import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Display } from "@/components/ui";
import { products } from "@/data/products";
import { site } from "@/data/site";
import { displayName, formatPrice, isPreorder, paymentSplit, unitsFor } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { cartStore, setCartQty } from "@/lib/stores";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

export default function Cart() {
  const { colors } = useTheme();
  const cart = useStore(cartStore);

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
        <Ionicons name="bag-outline" size={48} color={colors.muted} />
        <Display style={{ textAlign: "center" }}>Your cart is empty</Display>
        <Body muted style={{ textAlign: "center" }}>Find something you love and add it here.</Body>
        <Button label="Browse the collection" onPress={() => router.push("/shop")} style={{ marginTop: 8 }} />
      </View>
    );
  }

  const lines = cart.flatMap((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return product ? [{ item, product }] : [];
  });
  const priced = lines.map((l) => ({ price: l.product.price, qty: l.item.qty, preorder: isPreorder(l.product) }));
  const split = paymentSplit(priced, site.preorderDepositPercent);
  const count = lines.reduce((n, l) => n + l.item.qty, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 150, gap: 14 }} showsVerticalScrollIndicator={false}>
        <Display style={{ fontSize: 30 }}>
          Your cart <Text style={{ fontSize: 20, color: colors.muted }}>({count})</Text>
        </Display>
        {lines.map(({ item, product }) => {
          const cap = unitsFor(product, item.size);
          return (
            <Card key={`${item.slug}-${item.size}`} style={{ flexDirection: "row", gap: 14, padding: 12 }}>
              <Pressable onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: product.slug } })} accessibilityRole="button" accessibilityLabel={`View ${displayName(product)}`}>
                <Image source={product.images[0].src} contentFit="cover" style={{ width: 84, height: 105, borderRadius: 10 }} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 19, color: colors.text }}>{displayName(product)}</Text>
                <Body muted style={{ fontSize: 13 }}>{`Size ${item.size} · ${product.sleeve}`}</Body>
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.accent }}>
                  {isPreorder(product) ? "Pre-order · " : ""}
                  {product.includesTrousers === false ? "Shirt only" : "Includes matching trousers"}
                </Text>
                {cap < item.qty && <Body style={{ color: colors.warn, fontSize: 12.5 }}>{cap <= 0 ? "Out of stock in this size." : `Only ${cap} left in this size.`}</Body>}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 999 }}>
                    <Pressable onPress={() => setCartQty(item.slug, item.size, item.qty - 1)} accessibilityRole="button" accessibilityLabel="Decrease quantity" style={{ width: 36, height: 34, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={item.qty === 1 ? "trash-outline" : "remove"} size={17} color={colors.text} />
                    </Pressable>
                    <Text style={{ width: 24, textAlign: "center", fontFamily: fonts.bodyBold, color: colors.text }}>{item.qty}</Text>
                    <Pressable onPress={() => setCartQty(item.slug, item.size, Math.min(cap, item.qty + 1))} accessibilityRole="button" accessibilityLabel="Increase quantity" style={{ width: 36, height: 34, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="add" size={17} color={colors.text} />
                    </Pressable>
                  </View>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.accent }}>{product.price !== undefined ? formatPrice(product.price * item.qty) : "Ask"}</Text>
                </View>
              </View>
            </Card>
          );
        })}
        <Card style={{ gap: 8 }}>
          <Row label="Items" value={String(count)} />
          <Row label="Total" value={split ? (formatPrice(split.total) ?? "") : "Confirmed on WhatsApp"} strong />
          {split?.hasPreorder && (
            <>
              <Row label="Pay at checkout" value={formatPrice(split.dueNow) ?? ""} />
              <Row label="Balance before delivery" value={formatPrice(split.balance) ?? ""} />
            </>
          )}
          <Body muted style={{ fontSize: 12 }}>Delivery cost is confirmed with you when we contact you.</Body>
        </Card>
      </ScrollView>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: PAGE_PADDING, backgroundColor: colors.bgDeep, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Button label={`Checkout${split ? ` · ${formatPrice(split.dueNow)}` : ""}`} onPress={() => router.push("/checkout")} />
      </View>
    </View>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontFamily: fonts.body, color: colors.muted }}>{label}</Text>
      <Text style={{ fontFamily: strong ? fonts.bodyBold : fonts.body, color: strong ? colors.accent : colors.text, fontSize: strong ? 17 : 15 }}>{value}</Text>
    </View>
  );
}
