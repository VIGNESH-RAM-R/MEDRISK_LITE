import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Logo } from "../components/Logo";
import { useTheme } from "../lib/theme";

export function LoadingScreen({
  error,
  onRetry,
}: {
  error?: string | null;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View className="flex-1 bg-bg dark:bg-darkbg items-center justify-center px-6">
      <Logo size={40} radius={12} />
      {error ? (
        <>
          <Text className="font-sans-bold mt-5 mb-2" style={{ color: colors.highlightText }}>
            {t("loading.couldNotLoad")}
          </Text>
          <Text className="text-ink3 dark:text-darkink3 text-sm text-center mb-4">{error}</Text>
          <TouchableOpacity onPress={onRetry} className="rounded-xl px-5 py-2.5" style={{ backgroundColor: colors.accent }}>
            <Text className="font-sans-bold" style={{ color: colors.onAccent }}>
              {t("loading.retry")}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.accentText} style={{ marginTop: 20 }} />
          <Text className="text-ink3 dark:text-darkink3 text-sm mt-3">{t("loading.loadingWorkspace")}</Text>
        </>
      )}
    </View>
  );
}
