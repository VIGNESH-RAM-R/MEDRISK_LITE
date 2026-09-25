import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { BarChart } from "../components/BarChart";
import { translatedComponents } from "../lib/constants";
import { classificationColor } from "../lib/fmea";
import { useApiClient } from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import { useTheme } from "../lib/theme";
import { confirmAsync } from "../lib/alert";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AnalyticsScreen() {
  const api = useApiClient();
  const { failureModes, auditLog, snapshots, saveSnapshot, deleteSnapshot } = useAppStore();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const components = translatedComponents(t);
  const [savingLabel, setSavingLabel] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...failureModes].sort((a, b) => b.rpn - a.rpn);
  const bars = sorted.slice(0, 15).map((f, i) => ({
    label: `#${i + 1}`,
    value: f.rpn,
    color: classificationColor(f.classification),
  }));

  const heat = components.map((c) => {
    const items = failureModes.filter((f) => f.componentId === c.id);
    const avg = items.length ? Math.round(items.reduce((a, f) => a + f.rpn, 0) / items.length) : 0;
    return { c, items, avg };
  });
  const maxAvg = Math.max(1, ...heat.map((h) => h.avg));

  const bands = { Acceptable: 0, ALARP: 0, Unacceptable: 0 };
  failureModes.forEach((f) => bands[f.classification]++);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <View className="flex-row flex-wrap" style={{ gap: 20 }}>
        <View
          className="rounded-2xl p-5"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: 320 }}
        >
          <Text className="font-sans-bold text-[13.5px] mb-3" style={{ color: colors.ink1 }}>
            {t("analytics.rpnByFailureMode")}
          </Text>
          {bars.length ? <BarChart bars={bars} labelColor={colors.ink3} /> : (
            <Text style={{ color: colors.ink3, fontSize: 12 }}>{t("analytics.noFailureModes")}</Text>
          )}
        </View>

        <View
          className="rounded-2xl p-5"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: 320 }}
        >
          <Text className="font-sans-bold text-[13.5px] mb-3" style={{ color: colors.ink1 }}>
            {t("analytics.heatmapTitle")}
          </Text>
          {heat.map(({ c, items, avg }) => {
            const intensity = Math.min(1, avg / 150);
            return (
              <View key={c.id} className="flex-row items-center mb-2" style={{ gap: 10 }}>
                <Text style={{ width: 160, fontSize: 11, fontWeight: "600", color: colors.ink2 }} numberOfLines={2}>
                  {c.name}
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: `rgba(251,113,133,${0.12 + intensity * 0.7})`,
                    justifyContent: "center",
                    paddingHorizontal: 8,
                  }}
                >
                  <Text style={{ fontSize: 10.5, fontWeight: "700", color: "#fff" }}>
                    {t("analytics.avgRpnModes", { avg, count: items.length })}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View
        className="rounded-2xl p-5 mt-5"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="font-sans-bold text-[13.5px]" style={{ color: colors.ink1 }}>
              {t("analytics.snapshotsTitle")}
            </Text>
            <Text style={{ fontSize: 10.5, color: colors.ink4, marginTop: 2 }}>
              {t("analytics.snapshotsSub")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setSavingLabel(t("analytics.defaultSnapshotLabel", { date: new Date().toLocaleDateString() }))}
            style={{ backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: colors.onAccent, fontWeight: "700", fontSize: 11.5 }}>{t("analytics.saveSnapshot")}</Text>
          </TouchableOpacity>
        </View>

        {savingLabel !== null && (
          <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
            <TextInput
              value={savingLabel}
              onChangeText={setSavingLabel}
              placeholder={t("analytics.snapshotNamePlaceholder")}
              placeholderTextColor={colors.ink4}
              style={{
                flex: 1,
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
                color: colors.ink1,
              }}
            />
            <TouchableOpacity
              onPress={async () => {
                const label = savingLabel.trim() || t("analytics.untitledSnapshot");
                setSavingLabel(null);
                await saveSnapshot(api, label);
              }}
              style={{ backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
            >
              <Text style={{ color: colors.onAccent, fontWeight: "700", fontSize: 11.5 }}>{t("common.save")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSavingLabel(null)} style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
              <Text style={{ color: colors.ink3, fontSize: 11.5 }}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {snapshots.length === 0 ? (
          <Text style={{ fontSize: 11.5, color: colors.ink3 }}>
            {t("analytics.noSnapshots")}
          </Text>
        ) : (
          snapshots.map((s) => {
            const d = s.statsJson;
            const nowAvg = failureModes.length
              ? Math.round(failureModes.reduce((a, f) => a + f.rpn, 0) / failureModes.length)
              : 0;
            const deltaAvg = nowAvg - d.avg;
            const deltaColor = deltaAvg < 0 ? "#34d399" : deltaAvg > 0 ? "#fb7185" : colors.ink3;
            const expanded = expandedId === s.id;
            return (
              <View key={s.id} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }}>
                <View className="flex-row items-center justify-between">
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text className="font-sans-semibold text-[12.5px]" style={{ color: colors.ink1 }} numberOfLines={1}>
                      {s.label}
                    </Text>
                    <Text style={{ fontSize: 10.5, color: colors.ink4 }}>
                      {fmtDate(s.createdAt)} · {t("analytics.snapshotMeta", { count: d.count, avg: d.avg })}
                    </Text>
                  </View>
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setExpandedId(expanded ? null : s.id)}
                      style={{ backgroundColor: colors.surface2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: colors.ink2 }}>
                        {expanded ? t("analytics.hide") : t("analytics.compare")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        if (await confirmAsync(t("analytics.deleteSnapshotConfirm"))) await deleteSnapshot(api, s.id);
                      }}
                    >
                      <Text style={{ color: colors.ink4, fontSize: 13 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {expanded && (
                  <View
                    className="flex-row flex-wrap mt-2 rounded-lg p-3"
                    style={{ backgroundColor: colors.surface2, gap: 16 }}
                  >
                    <View>
                      <Text style={{ fontSize: 10, color: colors.ink4 }}>{t("analytics.avgRpnStat")}</Text>
                      <Text style={{ fontWeight: "700", color: deltaColor }}>
                        {d.avg} → {nowAvg} ({deltaAvg > 0 ? "+" : ""}
                        {deltaAvg})
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 10, color: colors.ink4 }}>{t("analytics.unacceptableStat")}</Text>
                      <Text style={{ fontWeight: "700", color: colors.ink1 }}>
                        {d.bands.Unacceptable} → {bands.Unacceptable}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 10, color: colors.ink4 }}>{t("analytics.complianceStat")}</Text>
                      <Text style={{ fontWeight: "700", color: colors.ink1 }}>{d.compScore}%</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <View
        className="rounded-2xl p-5 mt-5 mb-6"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <Text className="font-sans-bold text-[13.5px] mb-3" style={{ color: colors.ink1 }}>
          {t("analytics.auditTrailTitle")}
        </Text>
        {auditLog.map((a) => (
          <View key={a.id} className="flex-row mb-2" style={{ gap: 12 }}>
            <Text style={{ width: 130, fontSize: 10.5, color: colors.ink4 }}>{fmtDate(a.createdAt)}</Text>
            <Text style={{ flex: 1, fontSize: 12, color: colors.ink1 }}>{a.text}</Text>
          </View>
        ))}
        {auditLog.length === 0 && <Text style={{ color: colors.ink3, fontSize: 12 }}>{t("analytics.noActivity")}</Text>}
      </View>
    </ScrollView>
  );
}
