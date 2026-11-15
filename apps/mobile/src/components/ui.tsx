import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

export type IconName = keyof typeof Ionicons.glyphMap;

/** Display (serif) heading. */
export function Display({ style, italic, ...rest }: TextProps & { italic?: boolean }) {
  const { colors } = useTheme();
  return <Text {...rest} style={[{ fontFamily: italic ? fonts.displayItalic : fonts.display, color: colors.text, fontSize: 28, lineHeight: 34 }, style]} />;
}

export function Body({ style, muted, bold, ...rest }: TextProps & { muted?: boolean; bold?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[{ fontFamily: bold ? fonts.bodyBold : fonts.body, color: muted ? colors.muted : colors.text, fontSize: 15, lineHeight: 22 }, style]}
    />
  );
}

/** Small spaced-out label above a heading. */
export function Eyebrow({ children, style }: { children: string; style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  return (
    <Text style={[{ fontFamily: fonts.bodyMedium, color: colors.accent, fontSize: 11, letterSpacing: 3.2, textTransform: "uppercase" }, style]}>{children}</Text>
  );
}

type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: "primary" | "outline" | "ghost";
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
};

export function Button({ label, variant = "primary", icon, style, small, disabled, ...rest }: ButtonProps) {
  const { colors } = useTheme();
  const bg = variant === "primary" ? colors.accent : "transparent";
  const fg = variant === "primary" ? colors.onAccent : variant === "outline" ? colors.accent : colors.text;
  const border = variant === "primary" ? colors.accent : variant === "outline" ? colors.accent : colors.border;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, paddingVertical: small ? 9 : 14, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={{ fontFamily: fonts.bodyBold, color: fg, fontSize: small ? 12 : 13, letterSpacing: 1.6, textTransform: "uppercase" }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, { backgroundColor: active ? colors.accent : "transparent", borderColor: active ? colors.accent : colors.border }]}
    >
      <Text style={{ fontFamily: active ? fonts.bodyBold : fonts.body, fontSize: 13, color: active ? colors.onAccent : colors.muted }}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, label, badge, color, size = 22 }: { icon: IconName; onPress?: () => void; label: string; badge?: number; color?: string; size?: number }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={styles.iconBtn}>
      <Ionicons name={icon} size={size} color={color ?? colors.text} />
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={{ color: colors.onAccent, fontSize: 10, fontFamily: fonts.bodyBold }}>{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: 16 }, style]}>{children}</View>;
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: "row", alignItems: "center" }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 999, borderWidth: 1, paddingHorizontal: 24 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 7 },
  iconBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: 2, right: 0, minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 3, alignItems: "center", justifyContent: "center" },
});
