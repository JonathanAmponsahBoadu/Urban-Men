import { BodoniModa_400Regular } from "@expo-google-fonts/bodoni-moda/400Regular";
import { BodoniModa_400Regular_Italic } from "@expo-google-fonts/bodoni-moda/400Regular_Italic";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { notificationsStore, prefsStore, useNotificationSetup } from "@/lib/notifications";
import { allStores } from "@/lib/stores";
import { useStoresReady } from "@/lib/storage";
import { fonts } from "@/theme/colors";
import { schemeStore, ThemeProvider, useTheme } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function Shell() {
  const { colors, scheme } = useTheme();
  useNotificationSetup();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: fonts.display, fontSize: 20 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[slug]" options={{ title: "" }} />
        <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
        <Stack.Screen name="order/[id]" options={{ title: "Your order" }} />
        <Stack.Screen name="orders" options={{ title: "My orders" }} />
        <Stack.Screen name="wishlist" options={{ title: "Wishlist" }} />
        <Stack.Screen name="custom-style" options={{ title: "Custom style" }} />
        <Stack.Screen name="sign-in" options={{ title: "Account" }} />
        <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ BodoniModa_400Regular, BodoniModa_400Regular_Italic, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });
  const storesReady = useStoresReady([schemeStore, notificationsStore, prefsStore, ...allStores]);
  const ready = fontsLoaded && storesReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
