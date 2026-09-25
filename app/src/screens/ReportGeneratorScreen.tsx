import { useState } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { buildManualHtml, buildReportHtml } from "../lib/pdfTemplates";
import { buildManualPdf, buildReportPdf } from "../lib/pdfBuilders";
import { useTheme } from "../lib/theme";

// expo-print's web target does not actually render HTML to a file (it's a
// thin `window.print()` stub there — see expo-print/src/ExponentPrint.web.ts),
// so the web build generates a real PDF with jsPDF instead. Native platforms
// use expo-print, which does properly convert HTML to a PDF file there.
async function deliverNativePdf(html: string, filename: string) {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
}

export function ReportGeneratorScreen() {
  const { workspace, failureModes, compliance, auditLog } = useAppStore();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const lang = i18n.language as "en" | "hi" | "ta";
  const [reportStatus, setReportStatus] = useState("");
  const [manualStatus, setManualStatus] = useState("");

  async function generateReport() {
    if (!workspace) return;
    setReportStatus(t("report.renderingReport"));
    try {
      if (Platform.OS === "web") {
        buildReportPdf({ workspace, failureModes, compliance, auditLog, lang }).save("MedRiskLite_FMEA_Report.pdf");
      } else {
        await deliverNativePdf(buildReportHtml({ workspace, failureModes, compliance, auditLog, lang }), "MedRiskLite_FMEA_Report.pdf");
      }
      setReportStatus(t("report.reportDownloaded"));
    } catch (e: any) {
      setReportStatus(t("report.reportFailed", { msg: e?.message || t("common.tryAgain") }));
    }
  }

  async function generateManual() {
    if (!workspace) return;
    setManualStatus(t("report.renderingManual"));
    try {
      if (Platform.OS === "web") {
        buildManualPdf({ workspace, compliance, lang }).save("MedRiskLite_Quickstart_Guide.pdf");
      } else {
        await deliverNativePdf(buildManualHtml({ workspace, compliance, lang }), "MedRiskLite_Quickstart_Guide.pdf");
      }
      setManualStatus(t("report.manualDownloaded"));
    } catch (e: any) {
      setManualStatus(t("report.manualFailed", { msg: e?.message || t("common.tryAgain") }));
    }
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <View className="flex-row flex-wrap" style={{ gap: 20 }}>
        <View
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: 300 }}
        >
          <Text className="font-sans-bold text-[15px] mb-2" style={{ color: colors.ink1 }}>
            {t("report.fmeaReportTitle")}
          </Text>
          <Text style={{ fontSize: 12.5, color: colors.ink2, marginBottom: 14, lineHeight: 18 }}>
            {t("report.fmeaReportDesc")}
          </Text>
          {(t("report.fmeaReportBullets", { returnObjects: true }) as string[]).map((b) => (
            <Text key={b} style={{ fontSize: 11.5, color: colors.ink2, marginBottom: 4 }}>
              • {b}
            </Text>
          ))}
          <TouchableOpacity
            onPress={generateReport}
            style={{ backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10, alignSelf: "flex-start", marginTop: 10 }}
          >
            <Text style={{ color: colors.onAccent, fontWeight: "700", fontSize: 13 }}>{t("report.generateReportBtn")}</Text>
          </TouchableOpacity>
          {reportStatus ? <Text style={{ fontSize: 11.5, color: colors.ink3, marginTop: 8 }}>{reportStatus}</Text> : null}
        </View>

        <View
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: 300 }}
        >
          <Text className="font-sans-bold text-[15px] mb-2" style={{ color: colors.ink1 }}>
            {t("report.manualTitle")}
          </Text>
          <Text style={{ fontSize: 12.5, color: colors.ink2, marginBottom: 14, lineHeight: 18 }}>
            {t("report.manualDesc")}
          </Text>
          {(t("report.manualBullets", { returnObjects: true }) as string[]).map((b) => (
            <Text key={b} style={{ fontSize: 11.5, color: colors.ink2, marginBottom: 4 }}>
              • {b}
            </Text>
          ))}
          <TouchableOpacity
            onPress={generateManual}
            style={{
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 18,
              paddingVertical: 11,
              borderRadius: 10,
              alignSelf: "flex-start",
              marginTop: 10,
            }}
          >
            <Text style={{ color: colors.ink1, fontWeight: "700", fontSize: 13 }}>{t("report.generateManualBtn")}</Text>
          </TouchableOpacity>
          {manualStatus ? <Text style={{ fontSize: 11.5, color: colors.ink3, marginTop: 8 }}>{manualStatus}</Text> : null}
        </View>
      </View>
    </ScrollView>
  );
}
