import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { Classification } from "../lib/fmea";
import { useTheme } from "../lib/theme";

const STYLES: Record<Classification, { bg: string; fg: string }> = {
  Acceptable: { bg: "rgba(52,211,153,.14)", fg: "#34d399" },
  ALARP: { bg: "rgba(245,158,11,.16)", fg: "#f59e0b" },
  Unacceptable: { bg: "rgba(251,113,133,.16)", fg: "#fb7185" },
};

export function ClassificationBadge({ value }: { value: Classification }) {
  const { t } = useTranslation();
  const style = STYLES[value];
  return (
    <View
      className="px-2.5 py-1 rounded-full self-start"
      style={{ backgroundColor: style.bg }}
    >
      <Text className="font-sans-bold text-[11px]" style={{ color: style.fg }}>
        {t(`classification.${value}`)}
      </Text>
    </View>
  );
}

const STATUS_STYLES: Record<string, { bg: string; fg: string } | null> = {
  complete: { bg: "rgba(52,211,153,.14)", fg: "#34d399" },
  partial: { bg: "rgba(245,158,11,.16)", fg: "#f59e0b" },
  pending: null,
};

export function StatusBadge({ value }: { value: string }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const preset = STATUS_STYLES[value];
  const style = preset ?? { bg: colors.surface2, fg: colors.ink2 };
  return (
    <View
      className="px-2.5 py-1 rounded-full self-start"
      style={{ backgroundColor: style.bg }}
    >
      <Text className="font-sans-bold text-[11px]" style={{ color: style.fg }}>
        {t(`complianceStatus.${value in STATUS_STYLES ? value : "pending"}`)}
      </Text>
    </View>
  );
}
