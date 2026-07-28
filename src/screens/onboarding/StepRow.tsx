import { View, StyleSheet } from "react-native";
import { colors, spacing } from "../../theme/theme";

interface StepRowProps {
  currentStep: number; // 0–4
  totalSteps?: number;
}

export function StepRow({ currentStep, totalSteps = 5 }: StepRowProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === currentStep ? styles.on : styles.off]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  on: {
    width: 20,
    backgroundColor: colors.primary,
  },
  off: {
    width: 6,
    backgroundColor: colors.primaryMid,
    opacity: 0.45,
  },
});
