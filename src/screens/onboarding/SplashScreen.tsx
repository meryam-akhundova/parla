import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

const PILLS = [
  { word: "abi", gloss: "bro · TR" },
  { word: "no mames", gloss: "no way · ES" },
  { word: "lan", gloss: "dude · TR" },
  { word: "laisse béton", gloss: "forget it · FR" },
];

export function SplashScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.center}>
        <View style={styles.logo}>
          <Text style={styles.logoSpark}>✦</Text>
        </View>
        <Text style={styles.brand}>parla</Text>
        <Text style={styles.tagline}>speak. shine. connect.</Text>

        <View style={styles.sparkleBlock}>
          <Text style={styles.sparkles}>✦  ✦  ✦</Text>
          <Text style={styles.sparkleCaption}>every word a little brighter</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          label="get started"
          onPress={() => navigation.navigate("SignUp")}
        />
        <Button
          label="i already have an account"
          variant="ghost"
          onPress={() => navigation.navigate("SignIn")}
        />
        <View style={styles.pills}>
          {PILLS.map((pill) => (
            <View key={pill.word} style={styles.pill}>
              <Text style={styles.pillWord}>{pill.word}</Text>
              <Text style={styles.pillGloss}>{pill.gloss}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  logoSpark: {
    fontSize: 28,
    color: colors.primary,
  },
  brand: {
    fontSize: 30,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    letterSpacing: -0.5,
    marginBottom: 3,
  },
  tagline: {
    fontSize: fontSize.small,
    color: colors.primaryFaint,
    letterSpacing: 0.5,
    marginBottom: spacing.xxl,
  },
  sparkleBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
  sparkles: {
    fontSize: 28,
    color: colors.primary,
    letterSpacing: 10,
  },
  sparkleCaption: {
    fontSize: fontSize.label,
    color: colors.primaryFaint,
  },
  bottom: {
    gap: spacing.sm,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryLight,
    margin: 3,
  },
  pillWord: {
    fontSize: fontSize.small,
    color: colors.primary,
  },
  pillGloss: {
    fontSize: fontSize.micro,
    color: colors.primaryFaint,
  },
});
