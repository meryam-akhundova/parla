import { Linking } from "react-native";
import Constants from "expo-constants";

type LegalExtra = {
  privacyUrl?: string;
  termsUrl?: string;
  supportUrl?: string;
  supportEmail?: string;
};

const defaults: Required<LegalExtra> = {
  privacyUrl: "https://parla.app/privacy",
  termsUrl: "https://parla.app/terms",
  supportUrl: "https://parla.app/support",
  supportEmail: "hello@parla.app",
};

function fromExtra(): Required<LegalExtra> {
  const legal = (Constants.expoConfig?.extra?.legal ?? {}) as LegalExtra;
  return {
    privacyUrl: legal.privacyUrl ?? defaults.privacyUrl,
    termsUrl: legal.termsUrl ?? defaults.termsUrl,
    supportUrl: legal.supportUrl ?? defaults.supportUrl,
    supportEmail: legal.supportEmail ?? defaults.supportEmail,
  };
}

export const legal = fromExtra();

export async function openLegalUrl(
  kind: "privacy" | "terms" | "support",
): Promise<void> {
  const url =
    kind === "privacy"
      ? legal.privacyUrl
      : kind === "terms"
        ? legal.termsUrl
        : legal.supportUrl;
  await Linking.openURL(url);
}

export async function openSupportEmail(): Promise<void> {
  await Linking.openURL(`mailto:${legal.supportEmail}?subject=parla%20support`);
}
