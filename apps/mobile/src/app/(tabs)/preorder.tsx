import { Linking, ScrollView, View } from "react-native";
import { PAGE_PADDING, ProductGrid } from "@/components/ProductGrid";
import { Body, Button, Card, Display, Eyebrow } from "@/components/ui";
import { products } from "@/data/products";
import { site, whatsappUrl } from "@/data/site";
import { isPreorder } from "@/lib/format";
import { router } from "expo-router";
import { Text } from "react-native";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

export default function Preorder() {
  const { colors } = useTheme();
  const list = products.filter(isPreorder);
  const pct = site.preorderDepositPercent;
  const full = pct >= 100;
  const steps = [
    { title: "Choose your design", text: "Pick a pre-order design below, then your shirt size. Matching trousers come with it unless the design says shirt only." },
    { title: full ? "Pay online" : `Pay ${pct}% to reserve it`, text: full ? "Pay the full amount with Mobile Money at checkout." : `Pay a ${pct}% deposit with Mobile Money at checkout. The rest is paid before delivery.` },
    { title: "We make it for you", text: "Your pieces are made after you order. Each design shows when it is expected, and we keep you posted." },
    { title: full ? "We deliver" : "Pay the balance, we deliver", text: full ? "When it is ready we deliver to your door." : "When it is ready we ask for the balance, then deliver to your door." },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40, gap: 18 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 6 }}>
        <Eyebrow>Pre-order</Eyebrow>
        <Display style={{ fontSize: 34, lineHeight: 38 }}>
          Be the first to wear it. <Display italic style={{ color: colors.accent, fontSize: 34, lineHeight: 38 }}>Reserve yours.</Display>
        </Display>
        <Body muted>These designs are made after you order, so you get yours fresh from the tailor, in your size.</Body>
      </View>

      <View style={{ gap: 10 }}>
        {steps.map((s, i) => (
          <Card key={s.title} style={{ flexDirection: "row", gap: 14 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: colors.onAccent }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 19, color: colors.text }}>{s.title}</Text>
              <Body muted style={{ fontSize: 13.5, marginTop: 2 }}>{s.text}</Body>
            </View>
          </Card>
        ))}
      </View>

      <Display style={{ fontSize: 26, marginTop: 8 }}>Open for pre-order</Display>
      {list.length > 0 ? (
        <ProductGrid products={list} />
      ) : (
        <Card style={{ alignItems: "center", gap: 8 }}>
          <Display style={{ fontSize: 22, textAlign: "center" }}>Nothing is open for pre-order right now.</Display>
          <Body muted style={{ textAlign: "center" }}>New designs are announced on Instagram and WhatsApp. You can also ask for something made just for you.</Body>
          <Button label="Request a custom style" onPress={() => router.push("/custom-style")} />
        </Card>
      )}
      <Button label="Ask about a pre-order" icon="logo-whatsapp" variant="outline" onPress={() => Linking.openURL(whatsappUrl("Hello Urban Men, I have a question about pre-ordering."))} />
    </ScrollView>
  );
}
