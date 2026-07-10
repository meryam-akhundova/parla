import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./types";
import { MainTabs } from "./MainTabs";
import { QuizScreen } from "../screens/QuizScreen";
import { SlangDropScreen } from "../screens/SlangDropScreen";
import { SplashScreen } from "../screens/onboarding/SplashScreen";
import { OnboardingLanguageScreen } from "../screens/onboarding/OnboardingLanguageScreen";
import { OnboardingGoalScreen } from "../screens/onboarding/OnboardingGoalScreen";
import { OnboardingPaceScreen } from "../screens/onboarding/OnboardingPaceScreen";
import { OnboardingFirstWordScreen } from "../screens/onboarding/OnboardingFirstWordScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen
          name="OnboardingLanguage"
          component={OnboardingLanguageScreen}
        />
        <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
        <Stack.Screen name="OnboardingPace" component={OnboardingPaceScreen} />
        <Stack.Screen
          name="OnboardingFirstWord"
          component={OnboardingFirstWordScreen}
        />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="SlangDrop" component={SlangDropScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
