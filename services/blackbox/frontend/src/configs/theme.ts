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
  primaryColor: "dark",
  primaryShade: 9,
  cursorType: "pointer",
});
