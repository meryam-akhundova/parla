import { useEffect, useRef } from "react";
import { Animated, Easing, View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { FadeSlideIn } from "../../components/animated/FadeSlideIn";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

const PILLS = [
  { word: "abi", gloss: "bro · TR" },
  { word: "no mames", gloss: "no way · ES" },
  { word: "lan", gloss: "dude · TR" },
  { word: "laisse béton", gloss: "forget it · FR" },
];

function FloatingPill({
  word,
  gloss,
  delay,
}: {
  word: string;
  gloss: string;
  delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5,
          duration: 1400 + delay * 0.4,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1400 + delay * 0.4,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const timer = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.pill, { opacity, transform: [{ translateY }] }]}
    >
      <Text style={styles.pillWord}>{word}</Text>
      <Text style={styles.pillGloss}>{gloss}</Text>
    </Animated.View>
  );
}

export function SplashScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();

  const sparkScale = useRef(new Animated.Value(1)).current;
  const sparkOpacity = useRef(new Animated.Value(0.7)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(sparkScale, {
            toValue: 1.18,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sparkOpacity, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(sparkScale, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(sparkOpacity, {
            toValue: 0.65,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [logoOpacity, logoScale, sparkOpacity, sparkScale]);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logo,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Animated.Text
            style={[
              styles.logoSpark,
              { opacity: sparkOpacity, transform: [{ scale: sparkScale }] },
            ]}
          >
            ✦
          </Animated.Text>
        </Animated.View>
        <FadeSlideIn delay={120}>
          <Text style={styles.brand}>parla</Text>
        </FadeSlideIn>
        <FadeSlideIn delay={200}>
          <Text style={styles.tagline}>speak. shine. connect.</Text>
        </FadeSlideIn>

        <FadeSlideIn delay={320} style={styles.sparkleBlock}>
          <Animated.Text
            style={[
              styles.sparkles,
              { opacity: sparkOpacity, transform: [{ scale: sparkScale }] },
            ]}
          >
            ✦  ✦  ✦
          </Animated.Text>
          <Text style={styles.sparkleCaption}>every word a little brighter</Text>
        </FadeSlideIn>
      </View>

      <View style={styles.bottom}>
        <FadeSlideIn delay={400}>
          <Button
            label="get started"
            onPress={() => navigation.navigate("SignUp")}
          />
        </FadeSlideIn>
        <FadeSlideIn delay={480}>
          <Button
            label="i already have an account"
            variant="ghost"
            onPress={() => navigation.navigate("SignIn")}
          />
        </FadeSlideIn>
        <View style={styles.pills}>
          {PILLS.map((pill, i) => (
            <FloatingPill
              key={pill.word}
              word={pill.word}
              gloss={pill.gloss}
              delay={520 + i * 90}
            />
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
    textAlign: "center",
  },
  tagline: {
    fontSize: fontSize.small,
    color: colors.primaryFaint,
    letterSpacing: 0.5,
    marginBottom: spacing.xxl,
    textAlign: "center",
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
