import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { PAGE_PADDING } from "@/components/ProductGrid";
import { Body, Button, Card, Display, Eyebrow } from "@/components/ui";
import { formatDate } from "@/lib/format";
import {
  clearAll,
  disableNotifications,
  enableNotifications,
  markAllRead,
  markRead,
  notificationsStore,
  notifyLocally,
  prefsStore,
  screenForUrl,
} from "@/lib/notifications";
import { useStore } from "@/lib/storage";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return formatDate(iso);
}

export default function Notifications() {
  const { colors } = useTheme();
  const items = useStore(notificationsStore);
  const prefs = useStore(prefsStore);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const unread = items.filter((n) => !n.read).length;

  const turnOn = async () => {
    setBusy(true);
    const r = await enableNotifications();
    setBusy(false);
    setNote(
      r.granted
        ? r.registered
          ? "Notifications are on. You will get order updates and new designs."
          : "Notifications are on for this phone. Live updates from the shop start once the shop's servers are connected."
        : "Notifications are blocked. You can allow them in your phone's settings for Urban Men.",
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: PAGE_PADDING, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
      <View style={{ gap: 4 }}>
        <Eyebrow>Updates</Eyebrow>
        <Display style={{ fontSize: 32 }}>Notifications</Display>
        <Body muted>{unread > 0 ? `${unread} new` : "You are all caught up."}</Body>
      </View>

      {prefs.permission !== "granted" && (
        <Card style={{ borderColor: colors.accent, gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="notifications" size={22} color={colors.onAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.text }}>Never miss an update</Text>
              <Body muted style={{ fontSize: 13.5 }}>Order progress, replies to your requests, new designs and pre-orders.</Body>
            </View>
          </View>
          <Button label={busy ? "One moment…" : "Turn on notifications"} disabled={busy} onPress={turnOn} />
        </Card>
      )}
      {note ? <Body muted style={{ fontSize: 13 }}>{note}</Body> : null}

      {items.length > 0 && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {unread > 0 ? (
            <Pressable onPress={markAllRead} accessibilityRole="button"><Text style={{ fontFamily: fonts.bodyMedium, color: colors.accent }}>Mark all read</Text></Pressable>
          ) : <View />}
          <Pressable onPress={clearAll} accessibilityRole="button"><Text style={{ fontFamily: fonts.body, color: colors.muted }}>Clear</Text></Pressable>
        </View>
      )}

      {items.length === 0 ? (
        <Card style={{ alignItems: "center", gap: 8, paddingVertical: 28 }}>
          <Ionicons name="notifications-outline" size={40} color={colors.muted} />
          <Display style={{ fontSize: 22, textAlign: "center" }}>Nothing yet</Display>
          <Body muted style={{ textAlign: "center" }}>Order updates, replies and new designs will appear here.</Body>
        </Card>
      ) : (
        items.map((n) => (
          <Pressable
            key={n.id}
            onPress={() => {
              markRead(n.id);
              const target = screenForUrl(n.url);
              if (target) router.push(target as never);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${n.title}. ${n.body}`}
          >
            <Card style={{ flexDirection: "row", gap: 14, borderColor: n.read ? colors.border : colors.accent, opacity: n.read ? 0.8 : 1 }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="sparkles-outline" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                  <Text style={{ flex: 1, fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text }}>{n.title}</Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: colors.muted }}>{timeAgo(n.at)}</Text>
                </View>
                <Body muted style={{ fontSize: 13.5, marginTop: 2 }}>{n.body}</Body>
              </View>
              {!n.read && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent, marginTop: 6 }} />}
            </Card>
          </Pressable>
        ))
      )}

      <Card style={{ gap: 14 }}>
        <Eyebrow>What to send me</Eyebrow>
        <Pref
          title="Order updates"
          sub="When your order is confirmed, made, on its way or delivered, and replies to your requests."
          value={prefs.orders}
          onChange={(v) => prefsStore.update((p) => ({ ...p, orders: v }))}
        />
        <Pref
          title="New designs and pre-orders"
          sub="Be first to know when a new design or a pre-order opens."
          value={prefs.news}
          onChange={(v) => prefsStore.update((p) => ({ ...p, news: v }))}
        />
        {prefs.permission === "granted" && (
          <View style={{ gap: 8 }}>
            <Button label="Send me a test notification" variant="outline" small icon="notifications-outline" onPress={() => notifyLocally({ title: "Hello from Urban Men", body: "This is how your notifications will look.", url: "/shop" }, 1)} />
            <Pressable onPress={() => { disableNotifications(); prefsStore.update((p) => ({ ...p, orders: false, news: false })); setNote("Notifications are off in the app."); }} accessibilityRole="button">
              <Text style={{ fontFamily: fonts.body, color: colors.muted, textAlign: "center", fontSize: 13, textDecorationLine: "underline" }}>Turn everything off</Text>
            </Pressable>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

function Pref({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text }}>{title}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 }}>{sub}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} accessibilityLabel={title} trackColor={{ true: colors.accent, false: colors.border }} thumbColor="#fff" />
    </View>
  );
}
