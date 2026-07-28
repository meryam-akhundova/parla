import type { ReactNode } from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "../../theme/theme";

interface OnboardingShellProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Extra bottom padding beyond the safe area (default lg). */
  bottomExtra?: number;
}

/** Cream canvas shared by splash-adjacent auth + onboarding flows. */
export function OnboardingShell({
  children,
  style,
  bottomExtra = spacing.lg,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: Math.max(insets.bottom, spacing.md) + bottomExtra,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
});
