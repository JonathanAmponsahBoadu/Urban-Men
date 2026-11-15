import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

const files = {
  full: { src: require("../../assets/brand/logo-full-black.png"), ratio: 1600 / 1702 },
  monogram: { src: require("../../assets/brand/logo-monogram-black.png"), ratio: 896 / 1011 },
  wordmark: { src: require("../../assets/brand/logo-wordmark-black.png"), ratio: 1600 / 962 },
} as const;

/** The brand logo, tinted by the theme: gold on dark, navy on light. Give it a height. */
export function Logo({ variant, height, style }: { variant: keyof typeof files; height: number; style?: StyleProp<ImageStyle> }) {
  const { scheme } = useTheme();
  const f = files[variant];
  return (
    <Image
      source={f.src}
      contentFit="contain"
      tintColor={scheme === "dark" ? "#e8b83a" : "#14213d"}
      accessibilityLabel="Urban Men Apparel"
      style={[{ height, width: height * f.ratio }, style]}
    />
  );
}
