import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Field } from "@/components/Field";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Chip, Display, Eyebrow } from "@/components/ui";
import { whatsappUrl } from "@/data/site";
import { useStore } from "@/lib/storage";
import { requestsStore, submitStyleRequest, userStore } from "@/lib/stores";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

const COLOURS = ["White", "Cream", "Black", "Navy", "Blue", "Charcoal", "Other"];
const MAX_PHOTOS = 4;

export default function CustomStyle() {
  const { colors } = useTheme();
  const user = useStore(userStore);
  const past = useStore(requestsStore);
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState(user?.phone ?? user?.email ?? "");
  const [colour, setColour] = useState<string | undefined>();
  const [budget, setBudget] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<string | undefined>();

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: MAX_PHOTOS - photos.length, quality: 0.7 });
    if (!res.canceled) setPhotos((cur) => [...cur, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
  };

  const submit = () => {
    if (description.trim().length < 10) return setError("Tell us a little more about the style you want (at least a sentence).");
    if (contact.trim().length < 5) return setError("Add a phone number or email so we can reach you.");
    setError("");
    const req = submitStyleRequest({ description: description.trim(), contact: contact.trim(), colour, budget: budget.trim() || undefined, images: photos });
    setSent(req.id);
    setDescription("");
    setPhotos([]);
  };

  if (sent) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 10 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="checkmark" size={30} color={colors.onAccent} />
        </View>
        <Display style={{ textAlign: "center" }}>Request received</Display>
        <Body muted style={{ textAlign: "center" }}>{`Your request number is ${sent}. We will review it and contact you with a quote.`}</Body>
        <Button label="Chat with us on WhatsApp" icon="logo-whatsapp" variant="outline" onPress={() => Linking.openURL(whatsappUrl(`Hello Urban Men, I just sent custom style request ${sent}.`))} />
        <Button label="Back to the shop" onPress={() => router.replace("/shop")} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={{ gap: 6 }}>
        <Eyebrow>Made for you</Eyebrow>
        <Display style={{ fontSize: 32, lineHeight: 36 }}>
          Request a <Display italic style={{ color: colors.accent, fontSize: 32, lineHeight: 36 }}>custom style.</Display>
        </Display>
        <Body muted>Describe the shirt you have in mind, and add photos if you have them. We will review it and come back with a quote.</Body>
      </View>
      <Field label="Describe the style" value={description} onChangeText={setDescription} multiline placeholder="e.g. A white long-sleeve shirt with a kente collar and cuffs, for a wedding on 20 December" />
      <View>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.2, color: colors.muted, textTransform: "uppercase", marginBottom: 8 }}>Photos (optional)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {photos.map((uri) => (
            <View key={uri}>
              <Image source={{ uri }} contentFit="cover" style={{ width: 84, height: 84, borderRadius: 10 }} />
              <Pressable onPress={() => setPhotos((c) => c.filter((u) => u !== uri))} accessibilityRole="button" accessibilityLabel="Remove photo" style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.text, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={14} color={colors.bg} />
              </Pressable>
            </View>
          ))}
          {photos.length < MAX_PHOTOS && (
            <Pressable onPress={pick} accessibilityRole="button" accessibilityLabel="Add photos" style={{ width: 84, height: 84, borderRadius: 10, borderWidth: 1, borderStyle: "dashed", borderColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="camera-outline" size={24} color={colors.accent} />
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.accent }}>Add</Text>
            </Pressable>
          )}
        </View>
      </View>
      <View>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.2, color: colors.muted, textTransform: "uppercase", marginBottom: 8 }}>Main colour (optional)</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {COLOURS.map((c) => <Chip key={c} label={c} active={colour === c} onPress={() => setColour(colour === c ? undefined : c)} />)}
        </View>
      </View>
      <Field label="Budget (optional)" value={budget} onChangeText={setBudget} placeholder="e.g. GH₵ 400" />
      <Field label="Phone or email" value={contact} onChangeText={setContact} autoCapitalize="none" />
      {error ? <Body style={{ color: colors.danger }} accessibilityRole="alert">{error}</Body> : null}
      <Button label="Send request" onPress={submit} />
      {past.length > 0 && (
        <Card style={{ gap: 6 }}>
          <Eyebrow>Your earlier requests</Eyebrow>
          {past.map((r) => (
            <View key={r.id} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Body style={{ flex: 1 }} numberOfLines={1}>{r.description}</Body>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: colors.accent }}>{r.status}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}
