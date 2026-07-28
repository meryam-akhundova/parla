import { useRef, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

interface PressScaleProps extends Omit<PressableProps, "children"> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale when pressed (default 0.97). */
  pressedScale?: number;
}

/** Pressable with a soft spring scale instead of opacity-only feedback. */
export function PressScale({
  children,
  style,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 220,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) animateTo(pressedScale);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      style={style}
      {...rest}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
