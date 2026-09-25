import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StatCard } from "../components/StatCard";
import { ClassificationBadge } from "../components/Badge";
import { DonutChart } from "../components/DonutChart";
import { useAppStore } from "../store/useAppStore";
import { classifyRpn } from "../lib/fmea";
import { componentName } from "../lib/constants";
import { useTheme } from "../lib/theme";
import { useApiClient } from "../lib/api";
import { useAnimatedNumber } from "../lib/useAnimatedNumber";

const SENSOR_LABEL_KEYS: Record<string, string> = {
  moisture: "dashboard.hardwareSensorMoisture",
  temperature: "dashboard.hardwareSensorTemperature",
};

const SENSOR_UNITS: Record<string, string> = {
  moisture: "%",
  temperature: "°C",
};

function AnimatedSensorValue({ value, unit }: { value: number; unit: string }) {
  const hasDecimal = !Number.isInteger(value);
  const animated = useAnimatedNumber(value);
  return <>{hasDecimal ? animated.toFixed(1) : Math.round(animated)}{unit}</>;
}

function HardwareMonitoringCard() {
  const { sensorReadings } = useAppStore();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const bySensor = ["moisture", "temperature"].map((sensorType) => ({
    sensorType,
    reading: sensorReadings.find((r) => r.sensorType === sensorType) ?? null,
  }));

  return (
    <View
      className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-5"
      style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
    >
      <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-3">
        {t("dashboard.hardwareCardTitle")}
      </Text>
      {bySensor.map(({ sensorType, reading }, i) => {
        const breached = reading?.thresholdBreached ?? false;
        const dotColor = !reading ? colors.ink3 : breached ? "#fb7185" : "#34d399";
        return (
          <View
            key={sensorType}
            className={`flex-row items-center justify-between py-2.5 ${
              i < bySensor.length - 1 ? "border-b border-border dark:border-darkborder" : ""
            }`}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-2.5 h-2.5 rounded-full mr-2.5"
                style={{ backgroundColor: dotColor }}
              />
              <View className="flex-1">
                <Text className="text-ink1 dark:text-darkink1 font-sans-semibold text-[12.5px]">
                  {(SENSOR_LABEL_KEYS[sensorType] ? t(SENSOR_LABEL_KEYS[sensorType]) : sensorType) +
                    " " +
                    t("dashboard.hardwareSensorSuffix")}
                </Text>
                <Text className="text-ink3 dark:text-darkink3 text-[11px]">
                  {reading ? new Date(reading.createdAt).toLocaleString() : t("dashboard.hardwareNoReadings")}
                </Text>
              </View>
            </View>
            <Text
              className="font-sans-extrabold mr-2"
              style={{ color: !reading ? colors.ink3 : breached ? "#fb7185" : colors.ink1 }}
            >
              {reading ? <AnimatedSensorValue value={reading.value} unit={SENSOR_UNITS[sensorType] || ""} /> : "—"}
            </Text>
            {reading && (
              <Text
                className="font-sans-bold text-[11px] px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: breached ? "rgba(251,113,133,.16)" : "rgba(52,211,153,.14)",
                  color: breached ? "#fb7185" : "#34d399",
                }}
              >
                {breached ? t("dashboard.hardwareBreach") : t("dashboard.hardwareNormal")}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

export function DashboardScreen() {
  const { failureModes, compliance, auditLog, workspace, refreshSensorReadings } = useAppStore();
  const { colors } = useTheme();
  const api = useApiClient();
  const { t } = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSensorReadings(api);
    }, 15000);
    return () => clearInterval(interval);
  }, [api, refreshSensorReadings]);

  const settings = {
    alarpFrom: workspace?.alarpFrom ?? 50,
    unacceptableFrom: workspace?.unacceptableFrom ?? 100,
  };

  const avgRpn = failureModes.length
    ? Math.round(failureModes.reduce((sum, f) => sum + f.rpn, 0) / failureModes.length)
    : 0;

  const highest = [...failureModes].sort((a, b) => b.rpn - a.rpn)[0];

  const complianceScore = compliance.length
    ? Math.round(
        (compliance.reduce((sum, c) => {
          if (c.status === "complete") return sum + 1;
          if (c.status === "partial") return sum + 0.5;
          return sum;
        }, 0) /
          compliance.length) *
          100
      )
    : 0;

  const bands = { Acceptable: 0, ALARP: 0, Unacceptable: 0 };
  for (const fm of failureModes) {
    bands[classifyRpn(fm.rpn, settings)]++;
  }

  const top5 = [...failureModes].sort((a, b) => b.rpn - a.rpn).slice(0, 5);

  return (
    <ScrollView className="flex-1 bg-bg dark:bg-darkbg px-4 pt-4">

      <View className="flex-row flex-wrap gap-3 mb-5">
        <StatCard
          label={t("dashboard.statFailureModes")}
          value={failureModes.length}
          sub={t("dashboard.statFailureModesSub", { count: failureModes.length })}
          color={colors.accentText}
          icon="#"
        />
        <StatCard
          label={t("dashboard.statAvgRpn")}
          value={avgRpn}
          sub={avgRpn >= 50 ? t("dashboard.statAvgRpnSubHigh") : t("dashboard.statAvgRpnSubOk")}
          color="#f59e0b"
          icon="Σ"
        />
        <StatCard
          label={t("dashboard.statHighestRpn")}
          value={highest ? highest.rpn : "—"}
          sub={highest ? t(`classification.${highest.classification}`) : undefined}
          color={colors.highlightText}
          icon="!"
        />
        <StatCard
          label={t("dashboard.statCompliance")}
          value={`${complianceScore}%`}
          sub={t("dashboard.statComplianceSub")}
          color="#34d399"
          icon="✓"
        />
      </View>

      <HardwareMonitoringCard />

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-5"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-3">{t("dashboard.alarpBreakdownTitle")}</Text>
        <View className="flex-row items-center" style={{ gap: 20 }}>
          <DonutChart
            segments={[
              { value: bands.Acceptable, color: "#34d399" },
              { value: bands.ALARP, color: "#f59e0b" },
              { value: bands.Unacceptable, color: "#fb7185" },
            ]}
            size={120}
            strokeWidth={16}
            centerLabel={String(failureModes.length)}
            textColor={colors.ink1}
          />
          <View style={{ gap: 8, flex: 1 }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs" style={{ color: colors.ink2 }}>{t("classification.Acceptable")}</Text>
              <Text className="font-sans-extrabold" style={{ color: "#34d399" }}>{bands.Acceptable}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs" style={{ color: colors.ink2 }}>{t("classification.ALARP")}</Text>
              <Text className="font-sans-extrabold" style={{ color: "#f59e0b" }}>{bands.ALARP}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs" style={{ color: colors.ink2 }}>{t("classification.Unacceptable")}</Text>
              <Text className="font-sans-extrabold" style={{ color: "#fb7185" }}>{bands.Unacceptable}</Text>
            </View>
          </View>
        </View>
      </View>

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-5"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-3">{t("dashboard.top5Title")}</Text>
        {top5.map((fm, i) => (
          <View
            key={fm.id}
            className={`flex-row items-center justify-between py-2.5 ${i < top5.length - 1 ? "border-b border-border dark:border-darkborder" : ""}`}
          >
            <View className="flex-1 pr-2">
              <Text className="text-ink1 dark:text-darkink1 font-sans-semibold text-[12.5px]" numberOfLines={1}>
                {fm.mode}
              </Text>
              <Text className="text-ink3 dark:text-darkink3 text-[11px]">{componentName(fm.componentId, t)}</Text>
            </View>
            <Text className="text-ink1 dark:text-darkink1 font-sans-extrabold mr-2">{fm.rpn}</Text>
            <ClassificationBadge value={fm.classification} />
          </View>
        ))}
        {top5.length === 0 && (
          <Text className="text-ink3 dark:text-darkink3 text-sm">{t("dashboard.top5Empty")}</Text>
        )}
      </View>

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-5"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-3">{t("dashboard.recentActivityTitle")}</Text>
        {auditLog.slice(0, 8).map((entry) => (
          <View key={entry.id} className="py-1.5 border-b border-border dark:border-darkborder">
            <Text className="text-ink1 dark:text-darkink1 text-[12px] font-sans">{entry.text}</Text>
            <Text className="text-ink3 dark:text-darkink3 text-[10.5px] mt-0.5">
              {entry.user?.name || entry.user?.email} · {new Date(entry.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}
        {auditLog.length === 0 && (
          <Text className="text-ink3 dark:text-darkink3 text-sm">{t("dashboard.recentActivityEmpty")}</Text>
        )}
      </View>

      <View
        className="rounded-2xl p-4 mb-10 border"
        style={{ backgroundColor: colors.accentSoft, borderColor: colors.accent + "40" }}
      >
        <View className="flex-row items-start gap-3">
          <View
            className="w-8 h-8 rounded-lg items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <Text style={{ color: colors.onAccent }} className="font-sans-bold">★</Text>
          </View>
          <View className="flex-1">
            <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-1">
              {t("dashboard.calloutTitle")}
            </Text>
            <Text className="text-ink2 dark:text-darkink2 text-[12.5px] leading-relaxed">
              {t("dashboard.calloutBody")}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
