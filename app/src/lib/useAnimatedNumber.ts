import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

// Ticks a displayed number smoothly toward `value` instead of jumping,
// so dashboard stats/charts read as "live" when new data arrives. Uses the
// plain `Animated` API (no react-native-reanimated in this project) driven
// off JS since we read the tween via a listener rather than a native style.
export function useAnimatedNumber(value: number, duration = 650): number {
  const animated = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;
    Animated.timing(animated, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value, duration, animated]);

  useEffect(() => {
    const id = animated.addListener(({ value: v }) => setDisplay(v));
    return () => animated.removeListener(id);
  }, [animated]);

  return display;
}
