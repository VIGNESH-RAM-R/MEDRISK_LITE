import { useState } from "react";
import { Linking, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Svg, { Circle } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../components/Badge";
import { useApiClient, type ComplianceClause } from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import { useTheme } from "../lib/theme";
import { notify } from "../lib/alert";

const NEXT_STATUS: Record<ComplianceClause["status"], ComplianceClause["status"]> = {
  pending: "partial",
  partial: "complete",
  complete: "pending",
};

function ScoreRing({ score, trackColor, textColor }: { score: number; trackColor: string; textColor: string }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  const color = score >= 70 ? "#34d399" : score >= 40 ? "#f59e0b" : "#fb7185";
  return (
    <View style={{ width: 140, height: 140, alignItems: "center", justifyContent: "center" }}>
      <Svg width={140} height={140} viewBox="0 0 140 140" style={{ position: "absolute" }}>
        <Circle cx={70} cy={70} r={r} stroke={trackColor} strokeWidth={14} fill="none" />
        <Circle
          cx={70}
          cy={70}
          r={r}
          stroke={color}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c}`}
          strokeDashoffset={c * (1 - score / 100)}
          transform="rotate(-90 70 70)"
        />
      </Svg>
      <Text style={{ fontSize: 26, fontWeight: "800", color: textColor }}>{score}%</Text>
    </View>
  );
}

async function uploadPickedFile(
  api: ReturnType<typeof useApiClient>,
  clauseId: string,
  addEvidence: (api: any, clauseId: string, form: FormData) => Promise<void>
) {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/*", "application/pdf", "text/plain", "text/csv"],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return;
  const asset = result.assets[0];

  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await fetch(asset.uri).then((r) => r.blob());
    form.append("file", blob, asset.name);
  } else {
    form.append("file", {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType || "application/octet-stream",
    } as any);
  }
  await addEvidence(api, clauseId, form);
}

export function ComplianceScreen() {
  const api = useApiClient();
  const { compliance, setComplianceStatus, addEvidence, removeEvidence } = useAppStore();
  const [uploadingTo, setUploadingTo] = useState<string | null>(null);
  const { colors } = useTheme();
  const { t } = useTranslation();

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

  return (
    <ScrollView className="flex-1 bg-bg dark:bg-darkbg px-4 pt-4">
      <View
        className="rounded-2xl p-5 mb-5 items-center border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <ScoreRing score={complianceScore} trackColor={colors.border} textColor={colors.ink1} />
        <Text className="text-xs mt-1" style={{ color: colors.ink3 }}>
          {t("compliance.liveScoreNote")}
        </Text>
      </View>

      {compliance.map((c) => (
        <View
          key={c.id}
          className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-3"
          style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
        >
          <View className="flex-row items-start justify-between mb-1">
            <View className="flex-1 pr-2">
              <Text className="text-ink3 dark:text-darkink3 text-xs font-sans-semibold">
                {c.clause} · {c.mapped}
              </Text>
              <Text className="text-ink1 dark:text-darkink1 font-sans-bold">{c.title}</Text>
            </View>
            <StatusBadge value={c.status} />
          </View>

          {c.evidence.length > 0 && (
            <View className="mb-2 mt-1" style={{ gap: 4 }}>
              {c.evidence.map((e) => (
                <View key={e.id} className="flex-row items-center" style={{ gap: 8 }}>
                  <TouchableOpacity onPress={() => Linking.openURL(e.fileUrl)} className="py-0.5" style={{ flex: 1 }}>
                    <Text className="text-xs underline" style={{ color: colors.accentText }} numberOfLines={1}>
                      📎 {e.fileName}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeEvidence(api, c.id, e.id)}>
                    <Text style={{ color: colors.ink4, fontSize: 12 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {c.evidence.length === 0 && (
            <Text className="text-ink3 dark:text-darkink3 text-xs mb-2 mt-1">{t("compliance.noEvidence")}</Text>
          )}

          <View className="flex-row gap-2 items-center flex-wrap">
            <TouchableOpacity
              onPress={() => setComplianceStatus(api, c.id, NEXT_STATUS[c.status])}
              className="px-3 py-1.5 rounded-lg bg-surface2 dark:bg-darksurface2 border border-border dark:border-darkborder"
            >
              <Text className="text-ink2 dark:text-darkink2 text-xs font-sans-bold">
                {t("compliance.markAs", { status: t(`complianceStatus.${NEXT_STATUS[c.status]}`) })}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={uploadingTo === c.id}
              onPress={async () => {
                setUploadingTo(c.id);
                try {
                  await uploadPickedFile(api, c.id, addEvidence);
                } catch (e: any) {
                  notify(t("compliance.attachFailedTitle"), e?.message || t("common.tryAgain"));
                } finally {
                  setUploadingTo(null);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-surface2 dark:bg-darksurface2 border border-border dark:border-darkborder"
            >
              <Text className="text-ink2 dark:text-darkink2 text-xs font-sans-bold">
                {uploadingTo === c.id ? t("compliance.uploading") : t("compliance.attachEvidence")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View className="h-10" />
    </ScrollView>
  );
}
