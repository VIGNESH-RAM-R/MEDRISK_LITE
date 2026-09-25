import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useAnimatedNumber } from "../lib/useAnimatedNumber";

// Segment arc lengths (and the center count) tween toward their new values
// instead of jumping, so re-classifying a failure mode or a live sensor
// update reads as "live" rather than a hard cut. Driven by a single 0..1
// Animated.Value read via listener (react-native-svg props aren't
// native-driver compatible, so this stays JS-driven).
export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 22,
  centerLabel,
  textColor = "#161b28",
}: {
  segments: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  textColor?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const targetDash = segments.map((s) => (s.value / total) * c);
  const key = targetDash.map((n) => n.toFixed(2)).join(",");

  const fromRef = useRef<number[]>(targetDash);
  const toRef = useRef<number[]>(targetDash);
  const tRef = useRef(1);
  const prevKey = useRef(key);
  const progress = useRef(new Animated.Value(1)).current;
  const [t, setT] = useState(1);

  useEffect(() => {
    if (key === prevKey.current) return;
    prevKey.current = key;
    fromRef.current = fromRef.current.map((f, i) => f + ((toRef.current[i] ?? f) - f) * tRef.current);
    toRef.current = targetDash;
    tRef.current = 0;
    progress.setValue(0);
    setT(0);
    Animated.timing(progress, { toValue: 1, duration: 650, useNativeDriver: false }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      tRef.current = value;
      setT(value);
    });
    return () => progress.removeListener(id);
  }, [progress]);

  const centerNum = centerLabel !== undefined ? Number(centerLabel) : NaN;
  const animatedCenter = useAnimatedNumber(Number.isFinite(centerNum) ? centerNum : 0);

  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(139,147,167,.18)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {segments.map((s, i) => {
          const from = fromRef.current[i] ?? 0;
          const to = toRef.current[i] ?? targetDash[i] ?? 0;
          const dash = from + (to - from) * t;
          const el = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return el;
        })}
      </Svg>
      {centerLabel ? (
        <Text className="font-display" style={{ fontSize: size * 0.16, color: textColor }}>
          {Number.isFinite(centerNum) ? Math.round(animatedCenter) : centerLabel}
        </Text>
      ) : null}
    </View>
  );
}
