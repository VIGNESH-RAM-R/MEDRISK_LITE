import { useAuth, useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import { useApiClient } from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import { useTheme } from "../lib/theme";
import { confirmAsync, notify } from "../lib/alert";
import { ThemeToggle } from "../components/ThemeToggle";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, setLanguage, type LanguageCode } from "../i18n";

const CHAT_MODELS = ["claude-sonnet-5", "claude-opus-5", "claude-haiku-4-5"];

async function downloadJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  if (Platform.OS === "web") {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

export function SettingsScreen() {
  const api = useApiClient();
  const { workspace, updateSettings, resetWorkspace, importWorkspace } = useAppStore();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { colors, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const [changingLang, setChangingLang] = useState(false);

  const [alarpFrom, setAlarpFrom] = useState(String(workspace?.alarpFrom ?? 50));
  const [unacceptableFrom, setUnacceptableFrom] = useState(
    String(workspace?.unacceptableFrom ?? 100)
  );
  const [chatScope, setChatScope] = useState<"redirect" | "refuse">(
    workspace?.chatScope ?? "redirect"
  );
  const [chatModel, setChatModel] = useState(workspace?.chatModel ?? CHAT_MODELS[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(false);
    await updateSettings(api, {
      alarpFrom: Number(alarpFrom) || 50,
      unacceptableFrom: Number(unacceptableFrom) || 100,
      chatScope,
      chatModel,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExport() {
    setBusy("export");
    try {
      const data = await api.exportWorkspace();
      await downloadJson(data, "MedRiskLite_Backup.json");
    } catch (e: any) {
      notify(t("settings.exportFailedTitle"), e?.message || t("common.tryAgain"));
    } finally {
      setBusy(null);
    }
  }

  async function handleImport() {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
    if (result.canceled || !result.assets?.length) return;
    setBusy("import");
    try {
      const text = await (await fetch(result.assets[0].uri)).text();
      const parsed = JSON.parse(text);
      await importWorkspace(api, { failureModes: parsed.failureModes || [], compliance: parsed.compliance || [] });
      notify(t("settings.importCompleteTitle"), t("settings.importCompleteBody"));
    } catch (e: any) {
      notify(t("settings.importFailedTitle"), e?.message || t("settings.importFailedBody"));
    } finally {
      setBusy(null);
    }
  }

  async function handleReset() {
    const confirmed = await confirmAsync(
      t("settings.resetConfirmTitle"),
      t("settings.resetConfirmBody")
    );
    if (!confirmed) return;
    setBusy("reset");
    try {
      await resetWorkspace(api);
    } finally {
      setBusy(null);
    }
  }

  async function handleLanguageChange(lang: LanguageCode) {
    if (lang === i18n.language) return;
    setChangingLang(true);
    await setLanguage(lang);
    setChangingLang(false);
  }

  return (
    <ScrollView className="flex-1 bg-bg dark:bg-darkbg px-4 pt-4">
      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-4"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px]">{t("settings.appearanceTitle")}</Text>
            <Text className="text-ink3 dark:text-darkink3 text-xs mt-0.5">
              {isDark ? t("settings.darkTheme") : t("settings.lightTheme")}
            </Text>
          </View>
          <ThemeToggle size={36} />
        </View>
      </View>

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-4"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-1">{t("settings.languageTitle")}</Text>
        <Text className="text-ink3 dark:text-darkink3 text-xs mb-3">{t("settings.languageSub")}</Text>
        <View className="flex-row flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((code) => (
            <TouchableOpacity
              key={code}
              disabled={changingLang}
              onPress={() => handleLanguageChange(code)}
              className="px-3 py-2 rounded-xl border"
              style={{
                backgroundColor: i18n.language === code ? colors.tabActive : colors.surface,
                borderColor: colors.tabActive,
              }}
            >
              <Text
                className="text-xs font-sans-semibold"
                style={{ color: i18n.language === code ? (isDark ? colors.bg : "#ffffff") : colors.tabActive }}
              >
                {LANGUAGE_LABELS[code]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-4"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-3">{t("settings.rpnConfigTitle")}</Text>
        <Text className="text-xs text-ink3 dark:text-darkink3 font-sans-semibold mb-1">{t("settings.alarpFromLabel")}</Text>
        <TextInput
          value={alarpFrom}
          onChangeText={setAlarpFrom}
          keyboardType="numeric"
          className="bg-surface2 dark:bg-darksurface2 border border-border dark:border-darkborder rounded-xl px-3 py-2 mb-3 text-ink1 dark:text-darkink1"
        />
        <Text className="text-xs text-ink3 dark:text-darkink3 font-sans-semibold mb-1">{t("settings.unacceptableFromLabel")}</Text>
        <TextInput
          value={unacceptableFrom}
          onChangeText={setUnacceptableFrom}
          keyboardType="numeric"
          className="bg-surface2 dark:bg-darksurface2 border border-border dark:border-darkborder rounded-xl px-3 py-2 text-ink1 dark:text-darkink1"
        />
      </View>

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-4"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-1">{t("settings.aiAssistantTitle")}</Text>
        <Text className="text-ink3 dark:text-darkink3 text-xs mb-3">
          {t("settings.aiAssistantDesc")}
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {CHAT_MODELS.map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setChatModel(m)}
              className="px-3 py-2 rounded-xl border"
              style={{
                backgroundColor: chatModel === m ? colors.tabActive : colors.surface,
                borderColor: colors.tabActive,
              }}
            >
              <Text
                className="text-xs font-sans-semibold"
                style={{ color: chatModel === m ? (isDark ? colors.bg : "#ffffff") : colors.tabActive }}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-ink1 dark:text-darkink1 font-sans-semibold text-[12.5px] mb-1">{t("settings.rogerScopeTitle")}</Text>
        <Text className="text-ink3 dark:text-darkink3 text-xs mb-3">
          {t("settings.rogerScopeSub")}
        </Text>
        <View className="flex-row gap-2">
          {(["redirect", "refuse"] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setChatScope(opt)}
              className="flex-1 items-center py-2.5 rounded-xl border"
              style={{
                backgroundColor: chatScope === opt ? colors.tabActive : colors.surface,
                borderColor: colors.tabActive,
              }}
            >
              <Text
                className="font-sans-semibold"
                style={{
                  color: chatScope === opt ? (isDark ? colors.bg : "#ffffff") : colors.tabActive,
                }}
              >
                {opt === "redirect" ? t("settings.scopeRedirect") : t("settings.scopeRefuse")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={save}
        disabled={saving}
        className="rounded-xl py-3 items-center mb-6"
        style={{ backgroundColor: colors.accent }}
      >
        <Text style={{ color: colors.onAccent }} className="font-sans-bold">
          {saving ? t("common.saving") : saved ? t("settings.savedSettings") : t("settings.saveSettings")}
        </Text>
      </TouchableOpacity>

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-4"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-1">{t("settings.dataManagementTitle")}</Text>
        <Text className="text-ink3 dark:text-darkink3 text-xs mb-3">
          {t("settings.dataManagementDesc")}
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={handleExport}
            disabled={busy === "export"}
            className="px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="font-sans-bold text-xs" style={{ color: colors.ink1 }}>
              {busy === "export" ? t("settings.exporting") : t("settings.exportJson")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleImport}
            disabled={busy === "import"}
            className="px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }}
          >
            <Text className="font-sans-bold text-xs" style={{ color: colors.ink1 }}>
              {busy === "import" ? t("settings.importing") : t("settings.importJson")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReset}
            disabled={busy === "reset"}
            className="px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: colors.highlight }}
          >
            <Text className="font-sans-bold text-xs" style={{ color: colors.onHighlight }}>
              {busy === "reset" ? t("settings.resetting") : t("settings.resetDemoData")}
            </Text>
          </TouchableOpacity>
        </View>
        {Platform.OS !== "web" && (
          <Text style={{ fontSize: 10.5, color: colors.ink4, marginTop: 8 }}>
            {t("settings.webOnlyExportNote")}
          </Text>
        )}
      </View>

      <View
        className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-10"
        style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
      >
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[13.5px] mb-1">{t("settings.accountTitle")}</Text>
        <Text className="text-ink3 dark:text-darkink3 text-sm mb-4">
          {t("settings.signedInAs", { email: user?.primaryEmailAddress?.emailAddress })}
        </Text>
        <TouchableOpacity
          onPress={() => signOut()}
          className="self-start px-4 py-2 rounded-xl"
          style={{ backgroundColor: colors.highlight }}
        >
          <Text className="font-sans-bold text-sm" style={{ color: colors.onHighlight }}>
            {t("settings.signOut")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
