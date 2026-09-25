import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useAnimatedNumber } from "../lib/useAnimatedNumber";

function Bar({ targetHeight, color }: { targetHeight: number; color: string }) {
  const animated = useRef(new Animated.Value(targetHeight)).current;
  useEffect(() => {
    Animated.timing(animated, { toValue: targetHeight, duration: 650, useNativeDriver: false }).start();
  }, [targetHeight, animated]);
  return (
    <Animated.View
      style={{
        width: "100%",
        maxWidth: 22,
        height: animated,
        backgroundColor: color,
        borderRadius: 4,
      }}
    />
  );
}

function BarValueLabel({ value, labelColor }: { value: number; labelColor: string }) {
  const animated = useAnimatedNumber(value);
  return (
    <Text style={{ fontSize: 9, fontWeight: "700", color: labelColor, marginBottom: 2 }}>
      {Math.round(animated)}
    </Text>
  );
}

// Bars grow/shrink into their new heights and the value labels count up/down
// instead of snapping, so re-sorted or updated RPN data reads as "live".
export function BarChart({
  bars,
  height = 180,
  labelColor = "#8b93a7",
}: {
  bars: { label: string; value: number; color: string }[];
  height?: number;
  labelColor?: string;
}) {
  const max = Math.max(1, ...bars.map((b) => b.value));

  return (
    <View style={{ height, flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
      {bars.map((b, i) => {
        const barHeight = Math.max(3, (b.value / max) * (height - 24));
        return (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <BarValueLabel value={b.value} labelColor={labelColor} />
            <Bar targetHeight={barHeight} color={b.color} />
            <Text
              style={{ fontSize: 8.5, color: labelColor, marginTop: 4 }}
              numberOfLines={1}
            >
              {b.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
