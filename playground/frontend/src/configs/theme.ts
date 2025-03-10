import { createTheme } from "@mantine/core";
import { FONTS } from "./font";

export const MantineTheme = createTheme({
  fontFamily: FONTS.GEIST,
  fontFamilyMonospace: FONTS.GEIST_MONO,

  headings: {
    fontFamily: FONTS.GEIST,
  },

  defaultRadius: "sm",
  autoContrast: true,
  primaryColor: "gray",
  primaryShade: 0,
  cursorType: "pointer",

  components: {
    Paper: {
      defaultProps: {
        bg: "dark.8",
      },
    },
    Modal: {
      styles: {
        header: {
          background: "var(--mantine-color-dark-8)",
        },
      },
    },
  },
});
