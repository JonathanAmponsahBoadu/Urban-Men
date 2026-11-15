import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { FlatList, Linking, Pressable, ScrollView, Share, Text, useWindowDimensions, View, type ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PAGE_PADDING, ProductGrid } from "@/components/ProductGrid";
import { Body, Button, Card, Display, Eyebrow } from "@/components/ui";
import { products } from "@/data/products";
import { sizeChart } from "@/data/sizing";
import { whatsappUrl } from "@/data/site";
import { displayName, firstAvailableSize, formatPrice, fullName, isPreorder, orderable, stockLabel, unitsFor } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { addToCart, cartStore, toggleWishlist, wishlistStore } from "@/lib/stores";
import { SIZES, type Size } from "@/lib/types";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

type Tab = "details" | "measurements" | "reviews";

export default function ProductScreen() {
  const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const product = products.find((p) => p.slug === slug && p.published !== false);
  const cart = useStore(cartStore);
  const wishlist = useStore(wishlistStore);
  const [chosen, setChosen] = useState<Size | undefined>();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("details");
  const [page, setPage] = useState(0);
  const [added, setAdded] = useState(false);
  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const i = viewableItems[0]?.index;
    if (typeof i === "number") setPage(i);
  }).current;

  if (!product) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 }}>
        <Display>We could not find that shirt.</Display>
        <Button label="Back to the shop" onPress={() => router.replace("/shop")} />
      </View>
    );
  }

  const pre = isPreorder(product);
  const name = displayName(product);
  const size = chosen ?? firstAvailableSize(product);
  const units = size ? unitsFor(product, size) : 0;
  const inCart = size ? (cart.find((i) => i.slug === product.slug && i.size === size)?.qty ?? 0) : 0;
  const room = Math.max(0, units - inCart);
  const n = Math.min(qty, Math.max(room, 1));
  const stock = stockLabel(size ? units : 0, pre);
  const sold = !orderable(product);
  const withTrousers = product.includesTrousers !== false;
  const liked = wishlist.includes(product.slug);
  const toneColor = stock.tone === "ok" ? colors.ok : stock.tone === "low" ? colors.warn : colors.danger;
  const related = products.filter((p) => p.slug !== product.slug && p.published !== false).sort((a, b) => Number(b.sleeve === product.sleeve) - Number(a.sleeve === product.sleeve)).slice(0, 4);

  const add = () => {
    if (!size || room < 1) return;
    addToCart(product.slug, size, n);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const imgH = Math.min(width * 1.25, 560);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 14 }}>
              <Pressable onPress={() => Share.share({ message: `${fullName(product)} · Urban Men Apparel` })} accessibilityRole="button" accessibilityLabel="Share" hitSlop={8}>
                <Ionicons name="share-outline" size={22} color={colors.text} />
              </Pressable>
              <Pressable onPress={() => toggleWishlist(product.slug)} accessibilityRole="button" accessibilityLabel={liked ? "Remove from wishlist" : "Save to wishlist"} hitSlop={8}>
                <Ionicons name={liked ? "heart" : "heart-outline"} size={22} color={liked ? colors.accent : colors.text} />
              </Pressable>
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <FlatList
          data={product.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item }) => (
            <View style={{ width, height: imgH, backgroundColor: item.kind === "flat" ? "#e8ebf0" : colors.surface }}>
              <Image source={item.src} contentFit={item.kind === "flat" ? "contain" : "cover"} style={{ width, height: imgH }} accessibilityLabel={item.alt} />
            </View>
          )}
        />
        {product.images.length > 1 && (
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 }}>
            {product.images.map((_, i) => (
              <View key={i} style={{ width: i === page ? 22 : 8, height: 4, borderRadius: 2, backgroundColor: i === page ? colors.accent : colors.border }} />
            ))}
          </View>
        )}
        {product.images.length > 1 && <Body muted style={{ textAlign: "center", fontSize: 12, marginTop: 6 }}>Swipe to see the model and the shirt on its own</Body>}

        <View style={{ padding: PAGE_PADDING, gap: 14 }}>
          <Eyebrow>{`${product.sleeve} · ${product.colour}`}</Eyebrow>
          <Text style={{ fontFamily: fonts.display, fontSize: 38, lineHeight: 42, color: colors.text }}>{name}</Text>
          {product.localName ? (
            <Body muted>
              {product.name}
              {product.localMeaning ? <Text style={{ fontFamily: fonts.displayItalic }}>{`  ·  “${product.localName}” means ${product.localMeaning}`}</Text> : null}
            </Body>
          ) : null}

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 30, color: colors.accent }}>{formatPrice(product.price) ?? "Ask for price"}</Text>
            <View style={{ borderRadius: 999, borderWidth: 1, borderColor: toneColor, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: toneColor }}>{stock.text}</Text>
            </View>
          </View>
          <Body muted>{product.note}.</Body>

          {pre && (
            <Card style={{ borderColor: colors.accent, flexDirection: "row", gap: 10 }}>
              <Ionicons name="time-outline" size={20} color={colors.accent} />
              <Body style={{ flex: 1, fontSize: 14 }}>
                <Text style={{ fontFamily: fonts.bodyBold }}>Made for you after you order.</Text>
                {product.preorder?.readyBy ? ` Expected: ${product.preorder.readyBy}.` : ""} You pay a deposit now and the balance before delivery.
              </Body>
            </Card>
          )}
          <Card style={{ flexDirection: "row", gap: 10, borderColor: withTrousers ? colors.accent : colors.border }}>
            <Ionicons name={withTrousers ? "checkmark-circle-outline" : "information-circle-outline"} size={20} color={colors.accent} />
            <Body style={{ flex: 1, fontSize: 14 }}>
              {withTrousers ? (
                <>
                  <Text style={{ fontFamily: fonts.bodyBold }}>Comes with matching trousers</Text>, cut from the same cloth. We confirm your trouser size when we confirm your order.
                </>
              ) : (
                <>
                  <Text style={{ fontFamily: fonts.bodyBold }}>Shirt only.</Text> Trousers are not included with this one.
                </>
              )}
            </Body>
          </Card>

          {/* size */}
          <View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Eyebrow style={{ color: colors.muted }}>{`Size${size ? ` · ${size}` : ""}`}</Eyebrow>
              <Pressable onPress={() => setTab("measurements")} accessibilityRole="button"><Text style={{ fontFamily: fonts.body, color: colors.accent, fontSize: 13 }}>Size chart</Text></Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {SIZES.map((s) => {
                const out = unitsFor(product, s) <= 0;
                const on = size === s;
                return (
                  <Pressable
                    key={s}
                    disabled={out}
                    onPress={() => { setChosen(s); setQty(1); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on, disabled: out }}
                    accessibilityLabel={`Size ${s}${out ? ", sold out" : ""}`}
                    style={{ minWidth: 56, height: 46, borderRadius: 10, borderWidth: 1, borderColor: on ? colors.accent : colors.border, backgroundColor: on ? colors.accent : "transparent", alignItems: "center", justifyContent: "center", opacity: out ? 0.35 : 1 }}
                  >
                    <Text style={{ fontFamily: fonts.bodyBold, color: on ? colors.onAccent : colors.text, textDecorationLine: out ? "line-through" : "none" }}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
            {!pre && size && units > 0 && units <= 3 && <Body style={{ color: colors.warn, marginTop: 8, fontSize: 13 }}>{`Hurry, only ${units} left in size ${size}.`}</Body>}
          </View>

          {/* quantity */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Eyebrow style={{ color: colors.muted }}>Quantity</Eyebrow>
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 999 }}>
              <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} accessibilityRole="button" accessibilityLabel="Decrease quantity" style={{ width: 42, height: 40, alignItems: "center", justifyContent: "center", opacity: qty <= 1 ? 0.3 : 1 }}>
                <Ionicons name="remove" size={20} color={colors.text} />
              </Pressable>
              <Text style={{ width: 28, textAlign: "center", fontFamily: fonts.bodyBold, color: colors.text }}>{n}</Text>
              <Pressable onPress={() => setQty((q) => Math.min(Math.max(room, 1), q + 1))} disabled={qty >= room} accessibilityRole="button" accessibilityLabel="Increase quantity" style={{ width: 42, height: 40, alignItems: "center", justifyContent: "center", opacity: qty >= room ? 0.3 : 1 }}>
                <Ionicons name="add" size={20} color={colors.text} />
              </Pressable>
            </View>
            {inCart > 0 && <Body muted style={{ fontSize: 13 }}>{`${inCart} already in your cart`}</Body>}
          </View>

          <Button label={pre ? "Pre-order on WhatsApp" : "Order on WhatsApp"} icon="logo-whatsapp" variant="outline" onPress={() => Linking.openURL(whatsappUrl(`Hello Urban Men, I would like to ${pre ? "pre-order" : "order"} ${fullName(product)}${size ? `, size ${size}` : ""}, quantity ${n}${withTrousers ? ", with the matching trousers" : ""}.`))} />
        </View>

        {/* tabs */}
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: PAGE_PADDING }}>
          {([["details", "Details"], ["measurements", "Measurements"], ["reviews", "Reviews"]] as [Tab, string][]).map(([id, label]) => (
            <Pressable key={id} onPress={() => setTab(id)} accessibilityRole="tab" accessibilityState={{ selected: tab === id }} style={{ paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: tab === id ? colors.accent : "transparent" }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: tab === id ? colors.accent : colors.muted }}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ padding: PAGE_PADDING, gap: 12 }}>
          {tab === "details" && (
            <>
              <Display style={{ fontSize: 22 }}>About this shirt</Display>
              <Body muted>{product.description}</Body>
              <Display style={{ fontSize: 22, marginTop: 8 }}>Features</Display>
              {product.features.map((f) => (
                <View key={f} style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ width: 14, height: 1, backgroundColor: colors.accent, marginTop: 11 }} />
                  <Body style={{ flex: 1 }}>{f}</Body>
                </View>
              ))}
              {!withTrousers && <Body>Shirt only, trousers not included</Body>}
            </>
          )}
          {tab === "measurements" && (
            <>
              <Display style={{ fontSize: 22 }}>Size chart (cm)</Display>
              <Card style={{ padding: 0, overflow: "hidden" }}>
                <View style={{ flexDirection: "row", backgroundColor: colors.tint, paddingVertical: 10, paddingHorizontal: 12 }}>
                  {["Size", "Chest", "Shoulder", "Sleeve", "Length"].map((h) => (
                    <Text key={h} style={{ flex: 1, fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1, color: colors.muted, textTransform: "uppercase" }}>{h}</Text>
                  ))}
                </View>
                {sizeChart.map((r) => (
                  <View key={r.size} style={{ flexDirection: "row", paddingVertical: 11, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: r.size === size ? colors.tint : "transparent" }}>
                    {[r.size, r.chest, r.shoulder, r.sleeve, r.length].map((v, i) => (
                      <Text key={i} style={{ flex: 1, fontFamily: i === 0 ? fonts.bodyBold : fonts.body, color: i === 0 && r.size === size ? colors.accent : colors.text }}>{String(v)}</Text>
                    ))}
                  </View>
                ))}
              </Card>
              <Body muted style={{ fontSize: 13 }}>Measure a shirt that fits you well and compare it to the chart. Between sizes? Ask us on WhatsApp.</Body>
            </>
          )}
          {tab === "reviews" && (
            <>
              <Display style={{ fontSize: 22 }}>Ratings and reviews</Display>
              <Body muted>No reviews yet. Customer reviews will appear here once orders are delivered.</Body>
            </>
          )}
        </View>

        {related.length > 0 && (
          <View style={{ paddingHorizontal: PAGE_PADDING, marginTop: 18 }}>
            <Display style={{ fontSize: 24, marginBottom: 14 }}>You may also like</Display>
            <ProductGrid products={related} />
          </View>
        )}
      </ScrollView>

      {/* sticky buy bar */}
      <SafeAreaView edges={["bottom"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.bgDeep, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12, paddingHorizontal: PAGE_PADDING }}>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: fonts.bodyBold, color: colors.text }}>{name}</Text>
            <Text style={{ fontFamily: fonts.body, color: colors.accent }}>{`${formatPrice(product.price) ?? ""}${size ? ` · size ${size}` : ""}`}</Text>
          </View>
          {added ? (
            <Button label="View cart" icon="checkmark" onPress={() => router.push("/cart")} />
          ) : (
            <Button label={sold ? "Sold out" : room < 1 ? "Max in cart" : pre ? "Pre-order" : "Add to cart"} disabled={sold || !size || room < 1} onPress={add} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
