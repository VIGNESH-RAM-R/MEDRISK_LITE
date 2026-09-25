import { Text, View } from "react-native";
import { useAnimatedNumber } from "../lib/useAnimatedNumber";

// Splits e.g. "36%" into a tween-able number (36) plus the non-numeric
// prefix/suffix ("", "%") so the digits can count up/down while the rest of
// the string (units, placeholders like "—") renders untouched.
function splitNumeric(value: string | number): { prefix: string; number: number | null; suffix: string; decimals: number } {
  if (typeof value === "number") return { prefix: "", number: value, suffix: "", decimals: 0 };
  const match = value.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)([^\d]*)$/);
  if (!match) return { prefix: "", number: null, suffix: value, decimals: 0 };
  const [, prefix, num, suffix] = match;
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  return { prefix, number: Number(num), suffix, decimals };
}

function AnimatedStatValue({ value }: { value: string | number }) {
  const { prefix, number, suffix, decimals } = splitNumeric(value);
  const animated = useAnimatedNumber(number ?? 0);
  if (number === null) return <>{suffix}</>;
  const shown = decimals > 0 ? animated.toFixed(decimals) : Math.round(animated).toString();
  return <>{prefix}{shown}{suffix}</>;
}

export function StatCard({
  label,
  value,
  sub,
  color = "#006078",
  icon = "●",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
}) {
  return (
    <View
      className="flex-1 min-w-[150px] bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4"
      style={{
        shadowColor: "#101828",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}1a` }}
        >
          <Text style={{ color, fontWeight: "800", fontSize: 14 }}>{icon}</Text>
        </View>
        {sub ? (
          <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}14` }}>
            <Text className="text-[10px] font-sans-bold" style={{ color }}>
              {sub}
            </Text>
          </View>
        ) : null}
      </View>
      <Text className="font-display text-[22px] text-ink1 dark:text-darkink1 leading-tight">
        <AnimatedStatValue value={value} />
      </Text>
      <Text className="text-[12px] font-sans-semibold text-ink2 dark:text-darkink2 mt-1">{label}</Text>
    </View>
  );
}
