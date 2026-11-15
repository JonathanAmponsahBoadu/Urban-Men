import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, Text, View } from "react-native";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Display, Eyebrow } from "@/components/ui";
import { whatsappUrl } from "@/data/site";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/storage";
import { ordersStore } from "@/lib/stores";
import { ORDER_STATUSES } from "@/lib/types";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

const STEPS = ORDER_STATUSES.filter((s) => s !== "Cancelled");

export default function OrderScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useStore(ordersStore).find((o) => o.id === id);

  if (!order) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
        <Display>Order not found</Display>
        <Button label="My orders" onPress={() => router.replace("/orders")} />
      </View>
    );
  }
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const cancelled = order.status === "Cancelled";

  return (
    <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: "center", gap: 6 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="checkmark" size={30} color={colors.onAccent} />
        </View>
        <Eyebrow>Order placed</Eyebrow>
        <Display style={{ textAlign: "center" }}>{`Thank you${order.delivery.name ? `, ${order.delivery.name.split(" ")[0]}` : ""}.`}</Display>
        <Body muted style={{ textAlign: "center" }}>
          Your order number is <Text style={{ fontFamily: fonts.bodyBold, color: colors.text }}>{order.id}</Text>.
        </Body>
      </View>

      <Card style={{ gap: 12 }}>
        <Eyebrow>{cancelled ? "Cancelled" : "Progress"}</Eyebrow>
        {!cancelled &&
          STEPS.map((s, i) => (
            <View key={s} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: i <= stepIndex ? colors.accent : colors.border, backgroundColor: i <= stepIndex ? colors.accent : "transparent", alignItems: "center", justifyContent: "center" }}>
                {i <= stepIndex && <Ionicons name="checkmark" size={13} color={colors.onAccent} />}
              </View>
              <Text style={{ fontFamily: i === stepIndex ? fonts.bodyBold : fonts.body, color: i <= stepIndex ? colors.text : colors.muted }}>{s}</Text>
            </View>
          ))}
      </Card>

      <Card style={{ gap: 10 }}>
        <Eyebrow>Items</Eyebrow>
        {order.lines.map((l) => (
          <View key={`${l.slug}-${l.size}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.body, color: colors.text }}>{l.name}</Text>
              <Body muted style={{ fontSize: 12.5 }}>{`Size ${l.size} · Qty ${l.qty}${l.preorder ? " · Pre-order" : ""}`}</Body>
            </View>
            {l.price !== undefined && <Text style={{ fontFamily: fonts.bodyBold, color: colors.accent }}>{formatPrice(l.price * l.qty)}</Text>}
          </View>
        ))}
        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Body muted>{`Placed ${formatDate(order.createdAt)}`}</Body>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 18, color: colors.accent }}>{order.total !== undefined ? formatPrice(order.total) : "To confirm"}</Text>
          </View>
          {order.balance ? (
            <Body style={{ marginTop: 8, fontSize: 13.5 }}>
              <Text style={{ fontFamily: fonts.bodyBold }}>Pre-order:</Text>
              {` ${formatPrice(order.paidNow)} paid now, ${formatPrice(order.balance)} to pay before delivery${order.readyBy ? `. Expected: ${order.readyBy}` : ""}.`}
            </Body>
          ) : null}
        </View>
      </Card>

      <Card style={{ gap: 4 }}>
        <Eyebrow>Delivery</Eyebrow>
        <Body>{order.delivery.name} · {order.delivery.phone}</Body>
        <Body muted>{`${order.delivery.address}, ${order.delivery.region}${order.delivery.gps ? ` (${order.delivery.gps})` : ""}`}</Body>
        {order.delivery.trouserNote ? <Body muted>{`Trouser size: ${order.delivery.trouserNote}`}</Body> : null}
        <Body muted style={{ marginTop: 6, fontSize: 12.5 }}>
          {order.payment.method === "momo" ? `${order.payment.network} Mobile Money${order.payment.demo ? " (demo, nothing was charged)" : ""}` : "Payment to be arranged on WhatsApp"}
        </Body>
      </Card>

      <Button label="Ask about this order" icon="logo-whatsapp" variant="outline" onPress={() => Linking.openURL(whatsappUrl(`Hello Urban Men, I am asking about order ${order.id}.`))} />
      <Button label="Keep shopping" onPress={() => router.replace("/shop")} />
    </ScrollView>
  );
}
