import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { HeroSlides } from "@/components/HeroSlides";
import { Logo } from "@/components/Logo";
import { PAGE_PADDING, ProductGrid } from "@/components/ProductGrid";
import { Body, Button, Card, Display, Eyebrow, type IconName } from "@/components/ui";
import { products } from "@/data/products";
import { site, whatsappUrl } from "@/data/site";
import { displayName, isPreorder } from "@/lib/format";
import { prefsStore } from "@/lib/notifications";
import { useStore } from "@/lib/storage";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

const reasons: { title: string; text: string; icon: IconName }[] = [
  { title: "Luxury", text: "Finishing and detail you can see and feel.", icon: "diamond-outline" },
  { title: "Premium fabric", text: "Quality cotton, linen and authentic African prints.", icon: "layers-outline" },
  { title: "Classy", text: "Understated colour-blocking made for formal occasions.", icon: "sparkles-outline" },
  { title: "Impeccable fit", text: "Clean, tailored cuts that sit right on the shoulder.", icon: "resize-outline" },
  { title: "Unmatched style", text: "Signature looks you will not find on the rack.", icon: "star-outline" },
];

const SHOWN = 6;

export default function Home() {
  const { colors } = useTheme();
  const pre = products.filter(isPreorder);
  const notifyPrefs = useStore(prefsStore);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* brand + slideshow */}
      <View style={{ alignItems: "center", paddingHorizontal: PAGE_PADDING, paddingTop: 8 }}>
        <Logo variant="full" height={150} />
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 3.4, color: colors.accent, marginTop: 8, textTransform: "uppercase", textAlign: "center" }}>
          {site.tagline}
        </Text>
      </View>
      <View style={{ paddingHorizontal: PAGE_PADDING, marginTop: 18 }}>
        <HeroSlides />
      </View>
      <View style={{ paddingHorizontal: PAGE_PADDING, marginTop: 18, gap: 10 }}>
        <Button label="Shop apparels" icon="storefront-outline" onPress={() => router.push("/shop")} />
        <Button label="Request a custom style" icon="cut-outline" variant="outline" onPress={() => router.push("/custom-style")} />
      </View>

      {notifyPrefs.permission === "unknown" && (
        <Pressable
          onPress={() => router.push("/notifications" as never)}
          accessibilityRole="button"
          accessibilityLabel="Turn on notifications"
          style={{ marginHorizontal: PAGE_PADDING, marginTop: 22, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.accent, borderRadius: 16, padding: 14, backgroundColor: colors.tint }}
        >
          <Ionicons name="notifications" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.bodyBold, color: colors.text }}>Get order updates and new designs</Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.muted }}>Tap to turn on notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      )}

      {/* collection */}
      <View style={{ paddingHorizontal: PAGE_PADDING, marginTop: 40 }}>
        <Eyebrow>The collection</Eyebrow>
        <Display style={{ marginTop: 6 }}>
          Signature pieces in <Display italic style={{ color: colors.accent }}>authentic African print.</Display>
        </Display>
        <View style={{ marginTop: 18 }}>
          <ProductGrid products={products.slice(0, SHOWN)} />
        </View>
        <Button
          label={products.length > SHOWN ? `View ${products.length - SHOWN} more in shop` : "View all in shop"}
          icon="storefront-outline"
          variant="outline"
          style={{ marginTop: 24 }}
          onPress={() => router.push("/shop")}
        />
      </View>

      {/* pre-order */}
      {pre.length > 0 && (
        <View style={{ marginTop: 44, backgroundColor: colors.bgDeep, paddingVertical: 28, paddingHorizontal: PAGE_PADDING }}>
          <Eyebrow>Pre-order</Eyebrow>
          <Display style={{ marginTop: 6 }}>
            New designs, <Display italic style={{ color: colors.accent }}>made for you.</Display>
          </Display>
          <Body muted style={{ marginTop: 8 }}>Reserve the next pieces before they are made. Pick your design and size, pay a deposit, and we make it for you.</Body>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginHorizontal: -PAGE_PADDING }} contentContainerStyle={{ paddingHorizontal: PAGE_PADDING, gap: 12 }}>
            {pre.map((p) => (
              <Pressable key={p.slug} onPress={() => router.push({ pathname: "/product/[slug]", params: { slug: p.slug } })} style={{ width: 130 }} accessibilityRole="button" accessibilityLabel={`View ${displayName(p)}`}>
                <Image source={p.images[0].src} contentFit="cover" style={{ width: 130, height: 162, borderRadius: 12 }} />
                <Text numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text, marginTop: 6 }}>{displayName(p)}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Button label="See pre-order designs" style={{ marginTop: 18 }} onPress={() => router.push("/preorder")} />
        </View>
      )}

      {/* why us */}
      <View style={{ marginTop: 44, backgroundColor: colors.accent, paddingVertical: 30 }}>
        <View style={{ paddingHorizontal: PAGE_PADDING }}>
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 3.2, color: colors.onAccent, textTransform: "uppercase" }}>Why choose us</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.onAccent, marginTop: 6 }}>Professional. Timeless. Authentic.</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: PAGE_PADDING, gap: 12, paddingTop: 18 }}>
          {reasons.map((r) => (
            <View key={r.title} style={{ width: 200, backgroundColor: colors.bg, borderRadius: 18, padding: 18 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={r.icon} size={22} color={colors.onAccent} />
              </View>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.accent, marginTop: 14 }}>{r.title}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 4 }}>{r.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* contact */}
      <View style={{ paddingHorizontal: PAGE_PADDING, marginTop: 40 }}>
        <Card>
          <Eyebrow>Order or enquire</Eyebrow>
          <Display style={{ marginTop: 6 }}>
            Tell us what you need. <Display italic style={{ color: colors.accent }}>We will take it from there.</Display>
          </Display>
          <Button label="Order on WhatsApp" icon="logo-whatsapp" style={{ marginTop: 16 }} onPress={() => Linking.openURL(whatsappUrl("Hello Urban Men, I would like to place an order."))} />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Button label="Call" icon="call-outline" variant="outline" small style={{ flex: 1 }} onPress={() => Linking.openURL(site.phoneHref)} />
            <Button label="Instagram" icon="logo-instagram" variant="outline" small style={{ flex: 1 }} onPress={() => Linking.openURL(site.instagramUrl)} />
          </View>
        </Card>
        <Link href="/custom-style" style={{ marginTop: 18, textAlign: "center", color: colors.muted, fontFamily: fonts.body }}>
          Cannot find your style? Request a custom one
        </Link>
      </View>
    </ScrollView>
  );
}
