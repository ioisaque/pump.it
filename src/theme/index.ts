import { createTheme, Theme, ThemeOptions } from "@mui/material";
import { COMPACT_INPUT_FONT_SIZE, COMPACT_INPUT_HEIGHT_PX } from "components/form/inputConstants";
import {
  black,
  error,
  info,
  neutral,
  primary,
  quinzel,
  secondary,
  success,
  telecom,
  warning,
  white,
} from "./colors";

const fontSize = 14;

const baseOptions: ThemeOptions = {
  direction: "ltr",
  palette: {
    primary,
    secondary,
    neutral,
    error,
    warning,
    success,
    info,
    quinzel,
    telecom,
    black,
    white,
    divider: secondary.contrastText,
    background: { default: "#FFFFFF" },
    text: {
      primary: neutral.dark,
      secondary: primary.dark,
      disabled: error.dark,
    },
    mode: "light",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "4px",
          boxShadow: "none",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*": { boxSizing: "border-box" },
        html: {
          MozOsxFontSmoothing: "grayscale",
          WebkitFontSmoothing: "antialiased",
          height: "100%",
          width: "100%",
        },
        body: { height: "100%" },
        a: { textDecoration: "none", color: "inherit" },
        "#root": { height: "100%" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          alignItems: "center",
          backgroundColor: "transparent",
          "&:hover": { backgroundColor: "transparent" },
          "&.Mui-focused": { backgroundColor: "transparent" },
          "&.Mui-disabled": { backgroundColor: "transparent" },
        },
        sizeSmall: {
          height: COMPACT_INPUT_HEIGHT_PX,
          fontSize: COMPACT_INPUT_FONT_SIZE,
        },
        input: {
          paddingTop: 0,
          paddingBottom: 0,
          height: "auto",
          display: "flex",
          alignItems: "center",
          "&.MuiInputBase-inputSizeSmall": {
            paddingTop: 0,
            paddingBottom: 0,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          "&.MuiInputLabel-sizeSmall": {
            transform: "translate(14px, 11px) scale(1)",
          },
          "&.MuiInputLabel-sizeSmall.MuiInputLabel-shrink": {
            transform: "translate(14px, -9px) scale(0.75)",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          "&.MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            minHeight: "unset",
          },
          "&.MuiInputBase-inputSizeSmall": {
            paddingTop: 0,
            paddingBottom: 0,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          "&:hover": { backgroundColor: "transparent" },
          "&.Mui-focused": { backgroundColor: "transparent" },
          "&.Mui-disabled": { backgroundColor: "transparent" },
        },
        sizeSmall: {
          height: COMPACT_INPUT_HEIGHT_PX,
          fontSize: COMPACT_INPUT_FONT_SIZE,
        },
      },
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Open Sans', sans-serif",
    button: { fontWeight: 600 },
    body1: { fontSize },
    body2: { fontSize },
  },
  shape: { borderRadius: 4 },
};

export type themeColor =
  | "primary"
  | "secondary"
  | "warning"
  | "info"
  | "success"
  | "neutral"
  | "athenas"
  | "quinzel"
  | "emoji"
  | "master"
  | "telecom"
  | "black"
  | "white"
  | undefined;

export function icTheme(bg?: string) {
  const theme: Theme = createTheme(baseOptions);
  theme.palette.background.default = bg ?? "#FFF";
  return theme;
}
