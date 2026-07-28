import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { OnboardingShell } from "../onboarding/OnboardingShell";
import { onboardingChrome } from "../onboarding/onboardingChrome";
import { useAuthStore } from "../../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

export function SignInScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);

    if (!email.trim() || !password) {
      setError("email and password please");
      return;
    }

    setLoading(true);
    try {
      const err = await signIn(email.trim(), password);
      if (err) setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <OnboardingShell>
        <View style={styles.header}>
          <Text style={onboardingChrome.sparkle}>✦</Text>
          <Text style={[onboardingChrome.title, styles.titleLeft]}>
            welcome back
          </Text>
          <Text style={[onboardingChrome.subtitle, styles.subtitleLeft]}>
            pick up where you left off
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@email.com"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="your password"
            placeholderTextColor={colors.textMuted}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={onboardingChrome.primaryWrap}>
            <Button
              label={loading ? "signing in…" : "sign in"}
              onPress={onSubmit}
            />
          </View>

          <Pressable onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.switch}>
              new here? <Text style={styles.switchLink}>create an account</Text>
            </Text>
          </Pressable>
        </View>
      </OnboardingShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    marginBottom: spacing.xxl,
  },
  titleLeft: {
    textAlign: "left",
  },
  subtitleLeft: {
    textAlign: "left",
    marginBottom: 0,
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    color: colors.primarySoft,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.bodyLg,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  error: {
    fontSize: fontSize.small,
    color: colors.errorStrong,
    marginVertical: spacing.sm,
  },
  switch: {
    textAlign: "center",
    marginTop: spacing.md,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
