import type { NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  SignUp: undefined;
  OnboardingLanguage: undefined;
  OnboardingGender: undefined;
  OnboardingGoal: undefined;
  OnboardingPace: undefined;
  OnboardingFirstWord: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  SlangDrop: undefined;
  Quiz: { wordId?: string } | undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export type MainTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
