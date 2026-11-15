import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PAGE_PADDING, useCardWidth } from "@/components/ProductGrid";
import { ProductCard } from "@/components/ProductCard";
import { Body, Button, Chip, Display } from "@/components/ui";
import { products, type Colour, type Sleeve } from "@/data/products";
import { totalStock } from "@/lib/format";
import { isPreorder } from "@/lib/format";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

const SLEEVES: Sleeve[] = ["Long sleeve", "Short sleeve"];
const COLOURS: Colour[] = ["White", "Cream", "Black", "Navy", "Blue", "Charcoal"];
type Sort = "featured" | "price-asc" | "price-desc";
const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

export default function Shop() {
  const { colors } = useTheme();
  const { q: initialQ } = useLocalSearchParams<{ q?: string }>();
  const { cols, width, gap } = useCardWidth();
  const [q, setQ] = useState(initialQ ?? "");
  const [sheet, setSheet] = useState(false);
  const [sleeve, setSleeve] = useState<Sleeve | undefined>();
  const [picked, setPicked] = useState<Colour[]>([]);
  const [stockOnly, setStockOnly] = useState(false);
  const [preOnly, setPreOnly] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState<Sort>("featured");

  const minN = min.trim() === "" ? undefined : Number(min);
  const maxN = max.trim() === "" ? undefined : Number(max);
  const priceOn = (minN !== undefined && !Number.isNaN(minN)) || (maxN !== undefined && !Number.isNaN(maxN));
  const activeCount = (sleeve ? 1 : 0) + picked.length + (stockOnly ? 1 : 0) + (preOnly ? 1 : 0) + (priceOn ? 1 : 0);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = products.filter(
      (p) =>
        (!sleeve || p.sleeve === sleeve) &&
        (picked.length === 0 || picked.includes(p.colour)) &&
        (!stockOnly || totalStock(p) > 0) &&
        (!preOnly || isPreorder(p)) &&
        (minN === undefined || Number.isNaN(minN) || (p.price !== undefined && p.price >= minN)) &&
        (maxN === undefined || Number.isNaN(maxN) || (p.price !== undefined && p.price <= maxN)) &&
        (!needle || [p.name, p.localName ?? "", p.localMeaning ?? "", p.note, p.description, p.colour, p.sleeve, ...p.features].join(" ").toLowerCase().includes(needle)),
    );
    if (sort !== "featured") {
      list = [...list].sort((a, b) => {
        const pa = a.price ?? Number.POSITIVE_INFINITY;
        const pb = b.price ?? Number.POSITIVE_INFINITY;
        return sort === "price-asc" ? pa - pb : pb - pa;
      });
    }
    return list;
  }, [q, sleeve, picked, stockOnly, preOnly, minN, maxN, sort]);

  const clear = () => {
    setSleeve(undefined);
    setPicked([]);
    setStockOnly(false);
    setPreOnly(false);
    setMin("");
    setMax("");
  };
  const toggleColour = (c: Colour) => setPicked((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const removable: { key: string; label: string; remove: () => void }[] = [
    ...(sleeve ? [{ key: "sleeve", label: sleeve, remove: () => setSleeve(undefined) }] : []),
    ...picked.map((c) => ({ key: c, label: c, remove: () => toggleColour(c) })),
    ...(stockOnly ? [{ key: "stock", label: "In stock", remove: () => setStockOnly(false) }] : []),
    ...(preOnly ? [{ key: "pre", label: "Pre-order", remove: () => setPreOnly(false) }] : []),
    ...(priceOn ? [{ key: "price", label: `GH₵ ${min || 0}${max ? ` – ${max}` : "+"}`, remove: () => { setMin(""); setMax(""); } }] : []),
  ];

  const field = { fontFamily: fonts.body, color: colors.text, borderColor: colors.border, backgroundColor: colors.bgDeep };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        key={cols}
        data={shown}
        numColumns={cols}
        keyExtractor={(p) => p.slug}
        columnWrapperStyle={{ gap, paddingHorizontal: PAGE_PADDING }}
        contentContainerStyle={{ paddingBottom: 40, rowGap: 22 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ paddingHorizontal: PAGE_PADDING, paddingBottom: 6, gap: 12 }}>
            <Display style={{ fontSize: 30 }}>
              Shop <Display italic style={{ color: colors.accent, fontSize: 30 }}>apparels</Display>
            </Display>
            <View style={[{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, backgroundColor: colors.bgDeep, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.muted} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search shirts, colours, prints…"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                accessibilityLabel="Search shirts"
                style={{ flex: 1, paddingVertical: 11, paddingHorizontal: 10, fontFamily: fonts.body, color: colors.text }}
              />
              {q ? (
                <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pressable
                onPress={() => setSheet(true)}
                accessibilityRole="button"
                accessibilityLabel={`Filters, ${activeCount} active`}
                style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 }}
              >
                <Ionicons name="options-outline" size={18} color={colors.text} />
                <Text style={{ fontFamily: fonts.bodyMedium, color: colors.text }}>Filters</Text>
                {activeCount > 0 && (
                  <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }}>
                    <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: colors.onAccent }}>{activeCount}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable
                onPress={() => setSort(SORTS[(SORTS.findIndex((s) => s.id === sort) + 1) % SORTS.length].id)}
                accessibilityRole="button"
                accessibilityLabel={`Sort: ${SORTS.find((s) => s.id === sort)?.label}. Tap to change.`}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }}
              >
                <Ionicons name="swap-vertical" size={16} color={colors.muted} />
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>{SORTS.find((s) => s.id === sort)?.label}</Text>
              </Pressable>
              <Text style={{ marginLeft: "auto", fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>
                {shown.length} {shown.length === 1 ? "piece" : "pieces"}
              </Text>
            </View>
            {removable.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {removable.map((r) => (
                  <Pressable key={r.key} onPress={r.remove} accessibilityRole="button" accessibilityLabel={`Remove filter ${r.label}`} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.accent, borderRadius: 999, paddingVertical: 5, paddingLeft: 12, paddingRight: 8, backgroundColor: colors.tint }}>
                    <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.accent }}>{r.label}</Text>
                    <Ionicons name="close" size={14} color={colors.accent} />
                  </Pressable>
                ))}
                {removable.length > 1 && (
                  <Pressable onPress={clear} accessibilityRole="button" style={{ justifyContent: "center", paddingHorizontal: 6 }}>
                    <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted, textDecorationLine: "underline" }}>Clear all</Text>
                  </Pressable>
                )}
              </ScrollView>
            )}
          </View>
        }
        renderItem={({ item }) => <ProductCard product={item} width={width} />}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center", gap: 8 }}>
            <Display style={{ fontSize: 24 }}>Nothing matches that.</Display>
            <Body muted style={{ textAlign: "center" }}>Try fewer filters, or ask for a custom style.</Body>
            <Button label="Clear filters" variant="outline" small onPress={() => { clear(); setQ(""); }} />
          </View>
        }
      />

      <Modal visible={sheet} animationType="slide" transparent onRequestClose={() => setSheet(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }} onPress={() => setSheet(false)} accessibilityLabel="Close filters" />
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: colors.bgDeep, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: "86%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Display style={{ fontSize: 24 }}>Filters</Display>
            <Pressable onPress={() => setSheet(false)} accessibilityRole="button" accessibilityLabel="Close filters" hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 18, gap: 22 }} showsVerticalScrollIndicator={false}>
            <Group title="Sort">
              {SORTS.map((s) => <Chip key={s.id} label={s.label} active={sort === s.id} onPress={() => setSort(s.id)} />)}
            </Group>
            <Group title="Sleeve">
              <Chip label="All" active={!sleeve} onPress={() => setSleeve(undefined)} />
              {SLEEVES.map((s) => <Chip key={s} label={s} active={sleeve === s} onPress={() => setSleeve(s)} />)}
            </Group>
            <Group title="Colour">
              <Chip label="All" active={picked.length === 0} onPress={() => setPicked([])} />
              {COLOURS.map((c) => <Chip key={c} label={c} active={picked.includes(c)} onPress={() => toggleColour(c)} />)}
            </Group>
            <Group title="Availability">
              <Chip label="In stock only" active={stockOnly} onPress={() => setStockOnly((v) => !v)} />
              <Chip label="Pre-order only" active={preOnly} onPress={() => setPreOnly((v) => !v)} />
            </Group>
            <View>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.4, color: colors.muted, textTransform: "uppercase" }}>Price (GH₵)</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
                <TextInput value={min} onChangeText={setMin} keyboardType="numeric" placeholder="Min" placeholderTextColor={colors.muted} accessibilityLabel="Minimum price" style={[field, { flex: 1, borderWidth: 1, borderRadius: 10, padding: 11 }]} />
                <Text style={{ color: colors.muted, fontFamily: fonts.body }}>to</Text>
                <TextInput value={max} onChangeText={setMax} keyboardType="numeric" placeholder="Max" placeholderTextColor={colors.muted} accessibilityLabel="Maximum price" style={[field, { flex: 1, borderWidth: 1, borderRadius: 10, padding: 11 }]} />
              </View>
            </View>
          </ScrollView>
          <View style={{ flexDirection: "row", gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Button label="Clear" variant="ghost" onPress={clear} />
            <Button label={`Show ${shown.length} ${shown.length === 1 ? "piece" : "pieces"}`} style={{ flex: 1 }} onPress={() => setSheet(false)} />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.4, color: colors.muted, textTransform: "uppercase" }}>{title}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{children}</View>
    </View>
  );
}
