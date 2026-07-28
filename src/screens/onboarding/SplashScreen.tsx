import { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { FadeSlideIn } from "../../components/animated/FadeSlideIn";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

export function SplashScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();

  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.xxl,
          paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.lg,
        },
      ]}
    >
      <View pointerEvents="none" style={styles.atmosphere}>
        <View style={[styles.blob, styles.blobPurple]} />
        <View style={[styles.blob, styles.blobCoral]} />
      </View>

      <View style={styles.brandBlock}>
        <Animated.View
          style={[
            styles.logo,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Text style={styles.logoSpark}>✦</Text>
        </Animated.View>

        <FadeSlideIn delay={100} style={styles.block}>
          <Text style={styles.brand}>parla</Text>
        </FadeSlideIn>

        <FadeSlideIn delay={180} style={styles.block}>
          <Text style={styles.tagline}>to speak is to shine</Text>
        </FadeSlideIn>
      </View>

      <FadeSlideIn delay={280} style={styles.actions}>
        <View style={styles.primaryWrap}>
          <Button
            label="get started"
            onPress={() => navigation.navigate("SignUp")}
          />
        </View>
        <Button
          label="i already have an account"
          variant="ghost"
          onPress={() => navigation.navigate("SignIn")}
        />
      </FadeSlideIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobPurple: {
    width: 340,
    height: 340,
    backgroundColor: colors.primaryMid,
    opacity: 0.45,
    top: -90,
    right: -110,
  },
  blobCoral: {
    width: 280,
    height: 280,
    backgroundColor: colors.white,
    opacity: 0.7,
    bottom: 100,
    left: -120,
  },
  brandBlock: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  block: {
    width: "100%",
    alignItems: "center",
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  logoSpark: {
    fontSize: 32,
    lineHeight: 36,
    color: colors.primary,
    textAlign: "center",
  },
  brand: {
    width: "100%",
    fontSize: 48,
    lineHeight: 54,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  tagline: {
    width: "100%",
    fontSize: fontSize.title,
    lineHeight: 28,
    fontWeight: fontWeight.regular,
    color: colors.primarySoft,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: spacing.sm,
  },
  primaryWrap: {
    borderRadius: radius.lg,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
});
