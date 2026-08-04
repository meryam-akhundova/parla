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
import { LegalLinks } from "../../components/LegalLinks";
import { OnboardingShell } from "../onboarding/OnboardingShell";
import { onboardingChrome } from "../onboarding/onboardingChrome";
import { useAuthStore } from "../../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

export function SignUpScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const signUp = useAuthStore((s) => s.signUp);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);

    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setError("name, email, and a password (6+ chars) please");
      return;
    }

    setLoading(true);
    try {
      const err = await signUp(email.trim(), password, displayName.trim());
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
          <Text style={[onboardingChrome.title, styles.titleLeft]}>
            create your account <Text style={styles.inlineSpark}>✦</Text>
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>display name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="sofia"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.field}>
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
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="at least 6 characters"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={[onboardingChrome.primaryWrap, styles.submit]}>
            <Button
              label={loading ? "creating…" : "sign up"}
              onPress={onSubmit}
            />
          </View>

          <LegalLinks />

          <Pressable onPress={() => navigation.navigate("SignIn")}>
            <Text style={styles.switch}>
              already have an account?{" "}
              <Text style={styles.switchLink}>sign in</Text>
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
    marginBottom: spacing.xl,
  },
  titleLeft: {
    textAlign: "left",
    marginBottom: 0,
  },
  inlineSpark: {
    color: colors.primary,
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    color: colors.primarySoft,
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
  },
  submit: {
    marginTop: spacing.sm,
  },
  switch: {
    textAlign: "center",
    marginTop: spacing.xs,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
});
