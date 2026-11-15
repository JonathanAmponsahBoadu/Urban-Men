import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Field } from "@/components/Field";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Display, Eyebrow } from "@/components/ui";
import { userStore } from "@/lib/stores";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Optional account. Shoppers never need one to buy. Preview: the profile stays on this phone, and "Continue with
 * Google" asks for the Gmail address instead of opening Google's own screen (that arrives with the backend).
 */
export default function SignIn() {
  const { colors } = useTheme();
  const [google, setGoogle] = useState(false);
  const [gmail, setGmail] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const saveGoogle = () => {
    const e = gmail.trim().toLowerCase();
    if (!EMAIL.test(e)) return setError("Enter a valid Gmail address.");
    userStore.set({ name: e.split("@")[0], email: e, provider: "google" });
    router.back();
  };

  const save = () => {
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!EMAIL.test(email.trim())) return setError("Enter a valid email address.");
    userStore.set({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || undefined });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Eyebrow>Your account</Eyebrow>
        <Display>Sign up or log in</Display>
        <Body muted>An account is optional. It links your Gmail so your orders and wishlist follow you. You can always check out as a guest.</Body>

        <Pressable
          onPress={() => setGoogle((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 13 }}
        >
          <Ionicons name="logo-google" size={18} color={colors.text} />
          <Text style={{ fontFamily: fonts.bodyBold, color: colors.text, fontSize: 14 }}>Continue with Google</Text>
        </Pressable>
        {google && (
          <Card style={{ gap: 12 }}>
            <Field label="Your Gmail address" value={gmail} onChangeText={setGmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@gmail.com" />
            <Button label="Continue" onPress={saveGoogle} />
            <Body muted style={{ fontSize: 12 }}>Preview: Google's own screen appears here once the shop's servers are connected.</Body>
          </Card>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.4, color: colors.muted, textTransform: "uppercase" }}>or with email</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <Field label="Full name" value={name} onChangeText={setName} autoComplete="name" />
        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        <Field label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        {error ? <Body style={{ color: colors.danger }} accessibilityRole="alert">{error}</Body> : null}
        <Button label="Save profile" onPress={save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
