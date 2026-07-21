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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { RootNavigationProp } from "../../navigation/types";
import { Button } from "../../components/Button";
import { useAuthStore } from "../../store/authStore";
import { colors, spacing, radius, fontSize, fontWeight } from "../../theme/theme";

export function SignUpScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const insets = useSafeAreaInsets();
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
    const err = await signUp(email.trim(), password, displayName.trim());
    setLoading(false);

    if (err) {
      setError(err);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>create your account</Text>
        <Text style={styles.subtitle}>so your shine can follow you ✦</Text>
      </View>

      <View style={styles.form}>
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
          placeholder="at least 6 characters"
          placeholderTextColor={colors.textMuted}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={loading ? "creating…" : "sign up"}
          onPress={onSubmit}
        />

        <Pressable onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.switch}>
            already have an account? <Text style={styles.switchLink}>sign in</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.medium,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
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
    backgroundColor: colors.surface,
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