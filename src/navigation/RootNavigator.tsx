import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme/theme";
import { MainTabs } from "./MainTabs";
import { SlangDropScreen } from "../screens/SlangDropScreen";
import { VibeCheckScreen } from "../screens/VibeCheckScreen";
import { UnpackScreen } from "../screens/UnpackScreen";
import { ReviewScreen } from "../screens/ReviewScreen";
import { BookmarksScreen } from "../screens/BookmarksScreen";
import { SplashScreen } from "../screens/onboarding/SplashScreen";
import { SignInScreen } from "../screens/auth/SignInScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { OnboardingLanguageScreen } from "../screens/onboarding/OnboardingLanguageScreen";
import { OnboardingGenderScreen } from "../screens/onboarding/OnboardingGenderScreen";
import { OnboardingGoalScreen } from "../screens/onboarding/OnboardingGoalScreen";
import { OnboardingPaceScreen } from "../screens/onboarding/OnboardingPaceScreen";
import { OnboardingSwearWordsScreen } from "../screens/onboarding/OnboardingSwearWordsScreen";
import { OnboardingFirstWordScreen } from "../screens/onboarding/OnboardingFirstWordScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const initialized = useAuthStore((s) => s.initialized);
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);

  const profileLoaded = useAuthStore((s) => s.profileLoaded);

  if (!initialized || (session && !profileLoaded)) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const isLoggedIn = !!session;
  const needsOnboarding = isLoggedIn && !profile?.onboarding_completed;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // Guest: splash + auth
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : needsOnboarding ? (
          // Logged in, prefs not saved yet
          <>
            <Stack.Screen
              name="OnboardingLanguage"
              component={OnboardingLanguageScreen}
            />
            <Stack.Screen
              name="OnboardingGender"
              component={OnboardingGenderScreen}
            />
            <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
            <Stack.Screen name="OnboardingPace" component={OnboardingPaceScreen} />
            <Stack.Screen
              name="OnboardingSwearWords"
              component={OnboardingSwearWordsScreen}
            />
            <Stack.Screen
              name="OnboardingFirstWord"
              component={OnboardingFirstWordScreen}
            />
          </>
        ) : (
          // Fully set up
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="SlangDrop" component={SlangDropScreen} />
            <Stack.Screen name="VibeCheck" component={VibeCheckScreen} />
            <Stack.Screen name="Unpack" component={UnpackScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});