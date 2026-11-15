import { Text, TextInput, View, type TextInputProps } from "react-native";
import { fonts } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";

/** Labelled text input styled for the current theme. */
export function Field({ label, hint, style, ...rest }: TextInputProps & { label: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.2, color: colors.muted, textTransform: "uppercase", marginBottom: 6 }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...rest}
        style={[
          {
            fontFamily: fonts.body,
            fontSize: 15,
            color: colors.text,
            backgroundColor: colors.bgDeep,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
          },
          rest.multiline ? { minHeight: 90, textAlignVertical: "top" } : null,
          style,
        ]}
      />
      {hint ? <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 4 }}>{hint}</Text> : null}
    </View>
  );
}
