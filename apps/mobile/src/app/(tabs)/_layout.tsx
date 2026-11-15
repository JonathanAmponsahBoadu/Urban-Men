import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { View } from "react-native";
import { IconButton } from "@/components/ui";
import { Logo } from "@/components/Logo";
import { useUnreadCount } from "@/lib/notifications";
import { cartStore, wishlistStore } from "@/lib/stores";
import { useStore } from "@/lib/storage";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

function HeaderRight() {
  const { scheme, toggle } = useTheme();
  const wishlist = useStore(wishlistStore);
  const unread = useUnreadCount();
  return (
    <View style={{ flexDirection: "row", marginRight: 6 }}>
      <IconButton icon={scheme === "dark" ? "sunny-outline" : "moon-outline"} label={`Switch to ${scheme === "dark" ? "light" : "dark"} mode`} onPress={toggle} />
      <IconButton icon="notifications-outline" label={`Notifications, ${unread} new`} badge={unread} onPress={() => router.push("/notifications" as never)} />
      <IconButton icon="heart-outline" label="Wishlist" badge={wishlist.length} onPress={() => router.push("/wishlist")} />
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const cart = useStore(cartStore);
  const count = cart.reduce((n, i) => n + i.qty, 0);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 22 },
        headerRight: () => <HeaderRight />,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bgDeep, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.onAccent, fontFamily: fonts.bodyBold },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: () => <Logo variant="monogram" height={34} />,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="shop" options={{ title: "Shop", headerTitle: "", tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="preorder" options={{ title: "Pre-order", tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} /> }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: count > 0 ? count : undefined,
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="account" options={{ title: "Account", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
