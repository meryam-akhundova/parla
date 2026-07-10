export const colors = {
  // Primary (purple)
  primary: "#534AB7",
  primaryLight: "#EEEDFE",
  primaryMid: "#CECBF6",
  primaryText: "#3C3489",
  primaryFaint: "#AFA9EC",
  primarySoft: "#7F77DD",
  primaryDark: "#26215C",

  // Coral
  coralBg: "#FAECE7",
  coralText: "#993C1D",
  coralMid: "#F5C4B3",
  coralStrong: "#D85A30",
  coralDark: "#4A1B0C",

  // Teal
  tealBg: "#E1F5EE",
  tealText: "#0F6E56",
  tealStrong: "#1D9E75",
  tealDark: "#085041",

  // Amber
  amberBg: "#FAEEDA",
  amberText: "#854F0B",
  amberStrong: "#633806",
  amberDark: "#412402",

  // Error / avoid
  errorBg: "#FCEBEB",
  errorText: "#A32D2D",
  errorDark: "#791F1F",
  errorStrong: "#E24B4A",

  // Neutrals
  white: "#ffffff",
  surface: "#FAFAFA",
  background: "#F1EFE8",
  border: "#D3D1C7",
  borderLight: "#EDE9F5",

  // Text
  textPrimary: "#2C2C2A",
  textSecondary: "#888780",
  textMuted: "#B4B2A9",
  textPurple: "#26215C",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 999,
} as const;

export const fontSize = {
  micro: 10,
  label: 11,
  small: 12,
  body: 13,
  bodyLg: 14,
  heading: 15,
  headingLg: 17,
  title: 20,
  display: 28,
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
} as const;
