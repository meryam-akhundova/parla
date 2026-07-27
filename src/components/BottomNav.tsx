import { useEffect, useRef } from "react";
import { Animated, View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { colors, fontWeight } from "../theme/theme";

type NavTab = "home" | "explore" | "chat" | "me";

export type { NavTab };

interface BottomNavProps {
  active?: NavTab;
  onPressTab?: (tab: NavTab) => void;
}

const TABS: {
  id: NavTab;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { id: "home", label: "home", icon: "home" },
  { id: "explore", label: "explore", icon: "compass" },
  { id: "chat", label: "chat", icon: "message-circle" },
  { id: "me", label: "me", icon: "user" },
];

function NavItem({
  tab,
  isActive,
  onPress,
}: {
  tab: (typeof TABS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.92)).current;
  const color = isActive ? colors.primary : colors.textMuted;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.08 : 1,
      friction: 5,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [isActive, scale]);

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Feather name={tab.icon} size={20} color={color} />
      </Animated.View>
      <Text style={[styles.label, { color }]}>{tab.label}</Text>
    </Pressable>
  );
}

export function BottomNav({ active = "home", onPressTab }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      {TABS.map((tab) => (
        <NavItem
          key={tab.id}
          tab={tab}
          isActive={active === tab.id}
          onPress={() => onPressTab?.(tab.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  item: {
    alignItems: "center",
    gap: 3,
    minWidth: 56,
  },
  label: {
    fontSize: 9,
    fontWeight: fontWeight.regular,
  },
});
