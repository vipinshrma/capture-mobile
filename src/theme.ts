export const palette = {
  cream: "#F3F1ED",
  paper: "#FDFDFC",
  ink: "#1C1C1E",
  muted: "#626168",
  faint: "#8A888F",
  line: "#DCD8D2",
  accent: "#423F91",
  accentPressed: "#343178",
  accentSoft: "#ECEBF6",
  danger: "#C92A2A",
  success: "#287A43",
  warning: "#B56808",
  darkBackground: "#0D0D0F",
  darkSurface: "#1A1A1D",
  darkRaised: "#222226",
  darkText: "#F2F1ED",
  darkMuted: "#AAA8AD",
  darkFaint: "#7F7D84",
  darkLine: "#343438",
  darkAccentSoft: "#292743",
  darkAccentText: "#AAA5F0",
} as const;

export const lightTheme = {
  background: palette.cream,
  surface: palette.paper,
  surfaceRaised: "#FFFFFF",
  surfaceMuted: "#EBE8E2",
  text: palette.ink,
  textSecondary: palette.muted,
  textMuted: palette.faint,
  border: palette.line,
  accent: palette.accent,
  accentPressed: palette.accentPressed,
  accentSoft: palette.accentSoft,
  accentText: palette.accent,
  onAccent: "#FFFFFF",
  danger: palette.danger,
  success: palette.success,
  warning: palette.warning,
  scrim: "rgba(13,13,15,0.42)",
  shadow: "#282320",
} as const;

export const darkTheme = {
  background: palette.darkBackground,
  surface: palette.darkSurface,
  surfaceRaised: palette.darkRaised,
  surfaceMuted: "#242428",
  text: palette.darkText,
  textSecondary: palette.darkMuted,
  textMuted: palette.darkFaint,
  border: palette.darkLine,
  accent: palette.accent,
  accentPressed: "#5752B5",
  accentSoft: palette.darkAccentSoft,
  accentText: palette.darkAccentText,
  onAccent: "#FFFFFF",
  danger: "#FF8A8A",
  success: "#8CD7A1",
  warning: "#F4BA69",
  scrim: "rgba(0,0,0,0.68)",
  shadow: "#000000",
} as const;

export type AppTheme = { [Key in keyof typeof lightTheme]: string };

export const getTheme = (dark: boolean): AppTheme => dark ? darkTheme : lightTheme;

export const spacing = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;
export const radius = { sm: 12, md: 16, lg: 22, full: 999 } as const;

export const type = {
  display: { fontSize: 34, lineHeight: 39, fontWeight: "800" as const, letterSpacing: -1.1 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800" as const, letterSpacing: -0.65 },
  section: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const, letterSpacing: -0.25 },
  cardTitle: { fontSize: 17, lineHeight: 22, fontWeight: "700" as const, letterSpacing: -0.15 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  label: { fontSize: 14, lineHeight: 19, fontWeight: "600" as const },
  meta: { fontSize: 12.5, lineHeight: 17, fontWeight: "500" as const },
} as const;

// Legacy names remain mapped to the semantic palette for non-visual modules.
export const colors = {
  background: lightTheme.background,
  card: lightTheme.surface,
  surface: lightTheme.surfaceMuted,
  text: lightTheme.text,
  secondary: lightTheme.textSecondary,
  muted: lightTheme.textMuted,
  faint: lightTheme.textMuted,
  separator: lightTheme.border,
  accent: palette.accent,
  accentSoft: lightTheme.accentSoft,
  success: lightTheme.success,
  warning: lightTheme.warning,
  danger: lightTheme.danger,
  darkBackground: darkTheme.background,
  darkCard: darkTheme.surface,
  darkText: darkTheme.text,
} as const;

export const shadow = {
  shadowColor: palette.ink,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 20,
  elevation: 3,
} as const;
