import {
  createTheme,
  defaultVariantColorsResolver,
  parseThemeColor,
  VariantColorsResolver,
} from "@mantine/core";
import { FONTS } from "./font";

const variantColorResolver: VariantColorsResolver = (input) => {
  const defaultResolvedColors = defaultVariantColorsResolver(input);
  const parsedColor = parseThemeColor({
    color: input.color || input.theme.primaryColor,
    theme: input.theme,
  });

  // Override some properties for variant
  if (
    parsedColor.isThemeColor &&
    input.variant === "filled" &&
    parsedColor.color === "gray"
  ) {
    return {
      ...defaultResolvedColors,
      color: "var(--mantine-color-dark-9)",
    };
  }

  return defaultResolvedColors;
};

export const MantineTheme = createTheme({
  fontFamily: FONTS.GEIST,
  fontFamilyMonospace: FONTS.GEIST_MONO,

  headings: {
    fontFamily: FONTS.GEIST,
    fontWeight: "500",
  },

  variantColorResolver: variantColorResolver,

  defaultRadius: "sm",
  autoContrast: true,
  primaryColor: "gray",
  primaryShade: 0,
  cursorType: "pointer",
});
