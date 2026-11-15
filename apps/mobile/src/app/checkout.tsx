import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Field } from "@/components/Field";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Chip, Display, Eyebrow } from "@/components/ui";
import { products } from "@/data/products";
import { site, whatsappUrl } from "@/data/site";
import { displayName, formatPrice, fullName, isPreorder, paymentSplit } from "@/lib/format";
import { notifyLocally } from "@/lib/notifications";
import { useStore } from "@/lib/storage";
import { cartStore, placeOrder, userStore } from "@/lib/stores";
import { GHANA_REGIONS, MOMO_NETWORKS, type MomoNetwork, type Order } from "@/lib/types";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

const GH_PHONE = /^0\d{9}$/;
const GPS = /^[A-Z]{2,3}-\d{3,4}-\d{4}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v: string) => v.replace(/[\s-]/g, "");
const mask = (p: string) => `${p.slice(0, 3)} ••• ${p.slice(-3)}`;

export default function Checkout() {
  const { colors } = useTheme();
  const cart = useStore(cartStore);
  const user = useStore(userStore);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [region, setRegion] = useState<string>("Greater Accra");
  const [regionOpen, setRegionOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [gps, setGps] = useState("");
  const [notes, setNotes] = useState("");
  const [trouser, setTrouser] = useState("");
  const [network, setNetwork] = useState<MomoNetwork>("MTN MoMo");
  const [momo, setMomo] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(false);

  const lines = cart.flatMap((item) => {
    const product = products.find((p) => p.slug === item.slug);
    return product ? [{ product, size: item.size, qty: item.qty }] : [];
  });

  if (lines.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10 }}>
        <Display>Nothing to check out</Display>
        <Button label="Browse the collection" onPress={() => router.replace("/shop")} />
      </View>
    );
  }

  const split = paymentSplit(lines.map((l) => ({ price: l.product.price, qty: l.qty, preorder: isPreorder(l.product) })), site.preorderDepositPercent);
  const dueNow = split?.dueNow;

  const delivery = (): Order["delivery"] => ({
    name: name.trim(),
    phone: clean(phone),
    email: email.trim() || undefined,
    region,
    gps: gps.trim() ? gps.trim().toUpperCase() : undefined,
    address: address.trim(),
    notes: notes.trim() || undefined,
    trouserNote: trouser.trim() || undefined,
  });

  const validate = () => {
    if (name.trim().length < 2) return "Please enter your name.";
    if (!GH_PHONE.test(clean(phone))) return "Enter a 10-digit phone number, like 024 000 0000.";
    if (email.trim() && !EMAIL.test(email.trim())) return "That email does not look right.";
    if (address.trim().length < 5) return "Please enter your delivery address.";
    if (gps.trim() && !GPS.test(gps.trim().toUpperCase())) return "Ghana Post GPS looks like GA-123-4567.";
    return "";
  };

  const startPayment = () => {
    const problem = validate() || (!GH_PHONE.test(clean(momo)) ? "Enter the 10-digit Mobile Money number to pay from." : "");
    if (problem) return setError(problem);
    setError("");
    setApproving(true);
  };

  const finish = (method: "momo" | "whatsapp") => {
    const order = placeOrder(lines, delivery(), method === "momo" ? { method, network, phone: clean(momo), demo: true } : { method });
    setApproving(false);
    notifyLocally({ title: order.balance ? "Pre-order received" : "Order received", body: `Thank you! We are confirming order ${order.id}.`, url: "/orders" }, 2);
    if (method === "whatsapp") {
      const text = [
        `Hello Urban Men, I have placed order ${order.id}:`,
        ...order.lines.map((l) => `• ${l.qty} × ${l.name} (size ${l.size})${l.price !== undefined ? ` – ${formatPrice(l.price)}` : ""}`),
        order.total !== undefined ? `Total: ${formatPrice(order.total)}` : "Please confirm the price.",
        order.balance ? `Pre-order: ${formatPrice(order.paidNow)} now, balance ${formatPrice(order.balance)} before delivery.` : "",
        `Deliver to: ${address.trim()}, ${region}${gps.trim() ? ` (${gps.trim().toUpperCase()})` : ""}`,
        `Phone: ${clean(phone)}`,
        trouser.trim() ? `Trouser size: ${trouser.trim()}` : "",
      ].filter(Boolean).join("\n");
      Linking.openURL(whatsappUrl(text));
    }
    router.replace({ pathname: "/order/[id]", params: { id: order.id } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40, gap: 18 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card style={{ gap: 14 }}>
          <Eyebrow>1 · Delivery</Eyebrow>
          <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="024 000 0000" autoComplete="tel" />
          <Field label="Email (optional)" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" hint="For order updates." />
          <View>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.2, color: colors.muted, textTransform: "uppercase", marginBottom: 6 }}>Region</Text>
            <Pressable onPress={() => setRegionOpen(true)} accessibilityRole="button" accessibilityLabel={`Region: ${region}. Tap to change.`} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.bgDeep, borderColor: colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 }}>
              <Text style={{ fontFamily: fonts.body, color: colors.text, fontSize: 15 }}>{region}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.muted} />
            </Pressable>
          </View>
          <Field label="Delivery address" value={address} onChangeText={setAddress} multiline placeholder="House / street, area, town" />
          <Field label="Ghana Post GPS (optional)" value={gps} onChangeText={setGps} autoCapitalize="characters" placeholder="GA-123-4567" />
          <Field label="Trouser size, if different (optional)" value={trouser} onChangeText={setTrouser} placeholder="e.g. waist 34" hint="Matching trousers come with your shirt unless the design says otherwise." />
          <Field label="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
          <Body muted style={{ fontSize: 12.5 }}>Delivery cost is worked out from your location (Yango, Uber, Bolt rates) in a later update. For now we confirm it with you.</Body>
        </Card>

        <Card style={{ gap: 14 }}>
          <Eyebrow>2 · Pay with Mobile Money</Eyebrow>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {MOMO_NETWORKS.map((n) => <Chip key={n} label={n} active={network === n} onPress={() => setNetwork(n)} />)}
          </View>
          <Field label="MoMo number" value={momo} onChangeText={setMomo} keyboardType="phone-pad" placeholder="024 000 0000" />
          <Body style={{ color: colors.warn, fontSize: 13 }}>Demo mode: real MoMo payments are not connected yet. Nothing is charged, and your order is saved on this phone for testing only.</Body>
        </Card>

        <Card style={{ gap: 10 }}>
          <Eyebrow>Order summary</Eyebrow>
          {lines.map((l) => (
            <View key={`${l.product.slug}-${l.size}`} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ flex: 1, fontFamily: fonts.body, color: colors.text }}>{`${l.qty} × ${displayName(l.product)} (${l.size})${isPreorder(l.product) ? " · pre-order" : ""}`}</Text>
              <Text style={{ fontFamily: fonts.body, color: colors.accent }}>{l.product.price !== undefined ? formatPrice(l.product.price * l.qty) : "—"}</Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 6 }}>
            {split?.hasPreorder ? (
              <>
                <Line label="Order total" value={formatPrice(split.total) ?? ""} />
                <Line label="Pay now" value={formatPrice(split.dueNow) ?? ""} strong />
                <Line label="Balance before delivery" value={formatPrice(split.balance) ?? ""} />
                <Body muted style={{ fontSize: 12 }}>{`Pre-order items: ${site.preorderDepositPercent}% now, the rest before we deliver.`}</Body>
              </>
            ) : (
              <Line label="To pay" value={split ? (formatPrice(split.total) ?? "") : "To confirm"} strong />
            )}
          </View>
        </Card>

        {error ? <Body style={{ color: colors.danger }} accessibilityRole="alert">{error}</Body> : null}
        <Button label={`Pay${dueNow !== undefined ? ` ${formatPrice(dueNow)}` : ""} with MoMo`} onPress={startPayment} />
        <Button
          label="Order on WhatsApp instead"
          variant="ghost"
          onPress={() => {
            const problem = validate();
            if (problem) return setError(problem);
            setError("");
            finish("whatsapp");
          }}
        />
      </ScrollView>

      <Modal visible={regionOpen} transparent animationType="fade" onRequestClose={() => setRegionOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }} onPress={() => setRegionOpen(false)}>
          <View style={{ backgroundColor: colors.bgDeep, borderRadius: 16, maxHeight: "75%", overflow: "hidden" }}>
            <ScrollView>
              {GHANA_REGIONS.map((r) => (
                <Pressable key={r} onPress={() => { setRegion(r); setRegionOpen(false); }} accessibilityRole="button" style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: r === region ? fonts.bodyBold : fonts.body, color: r === region ? colors.accent : colors.text }}>{r}</Text>
                  {r === region && <Ionicons name="checkmark" size={18} color={colors.accent} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={approving} transparent animationType="fade" onRequestClose={() => setApproving(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: colors.bgDeep, borderRadius: 20, padding: 24, gap: 12, borderWidth: 1, borderColor: colors.accent }}>
            <View style={{ alignItems: "center" }}><Ionicons name="phone-portrait-outline" size={34} color={colors.accent} /></View>
            <Display style={{ fontSize: 26, textAlign: "center" }}>Approve on your phone</Display>
            <Body muted style={{ textAlign: "center" }}>
              {`A ${network} prompt for ${dueNow !== undefined ? formatPrice(dueNow) : "your order"} would be sent to ${mask(clean(momo))}. Enter your MoMo PIN there to confirm.`}
            </Body>
            <Body style={{ color: colors.warn, textAlign: "center", fontSize: 13 }}>Demo only: no prompt is sent and no money is charged.</Body>
            <Button label="Simulate approval" onPress={() => finish("momo")} />
            <Button label="Cancel" variant="ghost" onPress={() => setApproving(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ fontFamily: fonts.body, color: strong ? colors.text : colors.muted }}>{label}</Text>
      <Text style={{ fontFamily: strong ? fonts.bodyBold : fonts.body, color: strong ? colors.accent : colors.text, fontSize: strong ? 18 : 15 }}>{value}</Text>
    </View>
  );
}
