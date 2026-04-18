import { createTheme } from "@mui/material/styles";

/** 浅绿色系（提词页 / 全屏组件共用） */
export const colors = {
  primary: "#16A34A",
  primaryHover: "#15803D",
  secondary: "#4B5563",
  pageBg: "#ECFDF5",
  border: "#A7F3D0",
  title: "#14532D",
  iconMuted: "#166534",
  toolbarBg: "#D1FAE5",
  label: "#166534",
  track: "#BBF7D0",
  value: "#14532D",
  subtle: "#166534",
  scriptBg: "#F0FDF4",
  scriptText: "#14532D",
  scriptPlaceholder: "#86EFAC",
  danger: "#EF4444",
  black: "#000000",
  /** 全屏提词底：深绿底 + 浅色字，保证可读性 */
  fullscreenBg: "#022C22",
  fullscreenText: "#F0FDF4",
  fullscreenMuted: "#86EFAC",
  canvas: "#FFFFFF",
  dockPaper: "rgba(22, 101, 52, 0.78)",
} as const;

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: colors.primary },
    secondary: { main: colors.secondary },
    error: { main: colors.danger },
    background: { default: colors.pageBg, paper: colors.toolbarBg },
    text: { primary: colors.title, secondary: colors.label },
    divider: colors.border,
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.pageBg, margin: 0 },
        "#root": { minHeight: "100dvh", display: "flex", flexDirection: "column" },
      },
    },
  },
});

export const homeColors = {
  primary: "#16A34A",
  primaryHover: "#15803D",
  secondary: "#4B5563",
  pageBg: "#ECFDF5",
  surface: "#FFFFFF",
  border: "#BBF7D0",
  title: "#14532D",
  subtle: "#166534",
  inputBg: "#F0FDF4",
  shortcutBg: "#F0FDF4",
  shortcutBorder: "#BBF7D0",
} as const;

export const homeTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: homeColors.primary },
    secondary: { main: homeColors.secondary },
    background: { default: homeColors.pageBg, paper: homeColors.surface },
    text: { primary: homeColors.title, secondary: homeColors.subtle },
    divider: homeColors.border,
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: homeColors.pageBg, margin: 0 },
        "#root": { minHeight: "100dvh", display: "flex", flexDirection: "column" },
      },
    },
  },
});
