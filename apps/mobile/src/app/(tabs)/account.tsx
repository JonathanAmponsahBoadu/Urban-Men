import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Constants from "expo-constants";
import { Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Display, Eyebrow, type IconName } from "@/components/ui";
import { site, whatsappUrl } from "@/data/site";
import { useStore } from "@/lib/storage";
import { useUnreadCount } from "@/lib/notifications";
import { ordersStore, userStore, wishlistStore } from "@/lib/stores";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

export default function Account() {
  const { colors, scheme, toggle } = useTheme();
  const user = useStore(userStore);
  const orders = useStore(ordersStore);
  const wishlist = useStore(wishlistStore);
  const unread = useUnreadCount();

  const rows: { icon: IconName; label: string; sub?: string; onPress: () => void }[] = [
    { icon: "cube-outline", label: "My orders", sub: orders.length ? `${orders.length} placed` : undefined, onPress: () => router.push("/orders") },
    { icon: "notifications-outline", label: "Notifications", sub: unread ? `${unread} new` : "Order updates and new designs", onPress: () => router.push("/notifications" as never) },
    { icon: "heart-outline", label: "Wishlist", sub: wishlist.length ? `${wishlist.length} saved` : undefined, onPress: () => router.push("/wishlist") },
    { icon: "cut-outline", label: "Request a custom style", onPress: () => router.push("/custom-style") },
    { icon: "logo-whatsapp", label: "Chat with us on WhatsApp", onPress: () => Linking.openURL(whatsappUrl("Hello Urban Men, I have a question.")) },
    { icon: "call-outline", label: `Call ${site.phoneDisplay}`, onPress: () => Linking.openURL(site.phoneHref) },
    { icon: "logo-instagram", label: `@${site.instagramHandle}`, onPress: () => Linking.openURL(site.instagramUrl) },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
      <Card style={{ gap: 8 }}>
        {user ? (
          <>
            <Eyebrow>Signed in</Eyebrow>
            <Display style={{ fontSize: 26 }}>{user.name}</Display>
            <Body muted>{user.email}{user.phone ? ` · ${user.phone}` : ""}</Body>
            <Button label="Sign out" variant="outline" small style={{ alignSelf: "flex-start", marginTop: 6 }} onPress={() => userStore.set(null)} />
          </>
        ) : (
          <>
            <Display style={{ fontSize: 24 }}>Welcome to Urban Men</Display>
            <Body muted>Create a profile to check out faster. Orders and wishlist are saved on this phone.</Body>
            <Button label="Create profile" onPress={() => router.push("/sign-in")} style={{ marginTop: 6 }} />
          </>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <Pressable key={r.label} onPress={r.onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
            <Ionicons name={r.icon} size={22} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.text }}>{r.label}</Text>
              {r.sub ? <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>{r.sub}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </Card>

      <Card style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Ionicons name={scheme === "dark" ? "moon-outline" : "sunny-outline"} size={22} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.text }}>Light mode</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>{scheme === "dark" ? "Off (dark)" : "On"}</Text>
        </View>
        <Switch value={scheme === "light"} onValueChange={toggle} accessibilityLabel="Light mode" trackColor={{ true: colors.accent, false: colors.border }} thumbColor="#fff" />
      </Card>

      <Body muted style={{ textAlign: "center", fontSize: 12 }}>{`Urban Men Apparel · version ${Constants.expoConfig?.version ?? "1.0.0"} · preview build`}</Body>
    </ScrollView>
  );
}
