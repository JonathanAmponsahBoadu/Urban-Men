import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, Text, useWindowDimensions, View, type ViewToken } from "react-native";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { products } from "@/data/products";
import { displayName } from "@/lib/format";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

const SLUGS = ["emerald-kente-shirt", "midnight-panel-shirt", "sunburst-shirt", "wave-band-shirt"];
const INTERVAL_MS = 3500;

/** Swipeable slideshow of featured looks; advances by itself until the shopper touches it. */
export function HeroSlides() {
  const { colors } = useTheme();
  const { width: screen } = useWindowDimensions();
  const width = screen - PAGE_PADDING * 2;
  const height = Math.min(width * 1.2, 520);
  const slides = SLUGS.flatMap((s) => products.find((p) => p.slug === s) ?? []);
  const list = useRef<FlatList>(null);
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    const t = setInterval(() => {
      const next = (active + 1) % slides.length;
      list.current?.scrollToIndex({ index: next, animated: true });
      setActive(next);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [active, touched, slides.length]);

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const i = viewableItems[0]?.index;
    if (typeof i === "number") setActive(i);
  }).current;

  return (
    <View>
      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => p.slug}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onScrollBeginDrag={() => setTouched(true)}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        style={{ width, height, borderRadius: 16, overflow: "hidden" }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: item.slug } })} style={{ width, height }} accessibilityRole="button" accessibilityLabel={`View ${displayName(item)}`}>
            <Image source={item.images[0].src} contentFit="cover" style={{ width, height }} />
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, paddingTop: 48, backgroundColor: "rgba(19,25,37,0.72)" }}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 3, color: "#e8b83a", textTransform: "uppercase" }}>Signature collection</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 24, color: "#f5f1e8" }}>{displayName(item)}</Text>
            </View>
          </Pressable>
        )}
      />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 }}>
        {slides.map((s, i) => (
          <View key={s.slug} style={{ width: i === active ? 22 : 8, height: 4, borderRadius: 2, backgroundColor: i === active ? colors.accent : colors.border }} />
        ))}
      </View>
    </View>
  );
}
