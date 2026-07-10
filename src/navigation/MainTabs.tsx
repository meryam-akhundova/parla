import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import type { MainTabParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { ExploreScreen } from "../screens/ExploreScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { BottomNav } from "../components/BottomNav";
import type { NavTab } from "../components/BottomNav";

const Tab = createBottomTabNavigator<MainTabParamList>();

const ROUTE_TO_TAB: Record<keyof MainTabParamList, NavTab> = {
  Home: "home",
  Explore: "explore",
  Chat: "chat",
  Profile: "me",
};

const TAB_TO_ROUTE: Record<NavTab, keyof MainTabParamList> = {
  home: "Home",
  explore: "Explore",
  chat: "Chat",
  me: "Profile",
};

function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index]
    .name as keyof MainTabParamList;

  return (
    <BottomNav
      active={ROUTE_TO_TAB[activeRoute]}
      onPressTab={(tab) => {
        navigation.navigate(TAB_TO_ROUTE[tab]);
      }}
    />
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <MainTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
