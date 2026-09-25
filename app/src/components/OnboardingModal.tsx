import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

const DISMISSED_KEY = "medrisklite-onboarding-dismissed";

export async function isOnboardingDismissedLocally(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DISMISSED_KEY)) === "1";
  } catch {
    return false;
  }
}

export function OnboardingModal({
  visible,
  onSubmit,
  onSkip,
}: {
  visible: boolean;
  onSubmit: (data: { company: string; errors: string; question: string }) => Promise<void>;
  onSkip: () => void;
}) {
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState("");
  const [question, setQuestion] = useState("");
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  async function submit() {
    setSaving(true);
    await onSubmit({ company, errors, question });
    setSaving(false);
  }

  async function skip() {
    try {
      await AsyncStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
    onSkip();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(10,14,22,.72)",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: "#131a2a",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,.10)",
            padding: 24,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15, marginBottom: 4 }}>
            {t("onboarding.title")}
          </Text>
          <Text style={{ color: "rgba(255,255,255,.45)", fontSize: 11.5, marginBottom: 16, lineHeight: 16 }}>
            {t("onboarding.subtitle")}
          </Text>

          <Text style={{ color: "rgba(255,255,255,.7)", fontSize: 11.5, fontWeight: "600", marginBottom: 4 }}>
            {t("onboarding.companyLabel")}
          </Text>
          <TextInput
            value={company}
            onChangeText={setCompany}
            placeholder={t("onboarding.companyPlaceholder")}
            placeholderTextColor="rgba(255,255,255,.25)"
            style={{
              backgroundColor: "rgba(255,255,255,.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,.10)",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: "#eef1f8",
              fontSize: 12.5,
              marginBottom: 12,
            }}
          />

          <Text style={{ color: "rgba(255,255,255,.7)", fontSize: 11.5, fontWeight: "600", marginBottom: 4 }}>
            {t("onboarding.errorsLabel")}
          </Text>
          <TextInput
            value={errors}
            onChangeText={setErrors}
            placeholder={t("onboarding.optionalPlaceholder")}
            placeholderTextColor="rgba(255,255,255,.25)"
            multiline
            numberOfLines={2}
            style={{
              backgroundColor: "rgba(255,255,255,.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,.10)",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: "#eef1f8",
              fontSize: 12.5,
              marginBottom: 12,
              minHeight: 50,
              textAlignVertical: "top",
            }}
          />

          <Text style={{ color: "rgba(255,255,255,.7)", fontSize: 11.5, fontWeight: "600", marginBottom: 4 }}>
            {t("onboarding.questionLabel")}
          </Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder={t("onboarding.questionPlaceholder")}
            placeholderTextColor="rgba(255,255,255,.25)"
            multiline
            numberOfLines={2}
            style={{
              backgroundColor: "rgba(255,255,255,.05)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,.10)",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: "#eef1f8",
              fontSize: 12.5,
              marginBottom: 16,
              minHeight: 50,
              textAlignVertical: "top",
            }}
          />

          <TouchableOpacity
            onPress={submit}
            disabled={saving}
            style={{
              backgroundColor: "#23708A",
              borderRadius: 10,
              paddingVertical: 11,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 13 }}>
              {saving ? t("onboarding.saving") : t("onboarding.start")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={skip} style={{ alignItems: "center", paddingVertical: 6 }}>
            <Text style={{ color: "rgba(255,255,255,.4)", fontSize: 11.5 }}>{t("onboarding.skip")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
