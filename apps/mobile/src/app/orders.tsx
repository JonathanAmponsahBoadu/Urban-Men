import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Display } from "@/components/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { ordersStore } from "@/lib/stores";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

export default function Orders() {
  const { colors } = useTheme();
  const orders = useStore(ordersStore);

  if (orders.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
        <Display style={{ textAlign: "center" }}>No orders yet</Display>
        <Body muted style={{ textAlign: "center" }}>Orders you place on this phone will show here.</Body>
        <Button label="Browse the collection" onPress={() => router.replace("/shop")} />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40, gap: 12 }}>
      {orders.map((o) => (
        <Pressable key={o.id} onPress={() => router.push({ pathname: "/order/[id]", params: { id: o.id } })} accessibilityRole="button" accessibilityLabel={`Order ${o.id}, ${o.status}`}>
          <Card style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: colors.text }}>{o.id}</Text>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: colors.accent }}>{o.status}</Text>
            </View>
            <Body muted>{`${formatDate(o.createdAt)} · ${o.lines.reduce((n, l) => n + l.qty, 0)} item(s)${o.balance ? " · pre-order" : ""}`}</Body>
            <Text style={{ fontFamily: fonts.bodyBold, color: colors.accent }}>{o.total !== undefined ? formatPrice(o.total) : "Price to confirm"}</Text>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
