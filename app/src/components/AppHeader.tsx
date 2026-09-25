import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "./ThemeToggle";
import { translatedViews, type ViewId } from "../lib/constants";
import { useTheme } from "../lib/theme";

export function AppHeader({
  view,
  onMenuPress,
  showMenu,
}: {
  view: ViewId;
  onMenuPress?: () => void;
  showMenu?: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const views = translatedViews(t);
  const meta = views.find((v) => v.id === view) ?? views[0];

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        {showMenu && (
          <TouchableOpacity
            onPress={onMenuPress}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.ink1, fontSize: 15 }}>☰</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text className="font-display" style={{ fontSize: 19, color: colors.ink1 }} numberOfLines={1}>
            {meta.label}
          </Text>
          <Text style={{ fontSize: 11.5, color: colors.ink3, marginTop: 1 }} numberOfLines={1}>
            {meta.sub}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 999,
            backgroundColor: colors.surface2,
            borderWidth: 1,
            borderColor: colors.border,
            display: showMenu ? "none" : "flex",
          }}
        >
          <Text style={{ fontSize: 10.5, color: colors.ink2 }}>{t("header.deviceBadge")}</Text>
        </View>
        <ThemeToggle size={32} />
      </View>
    </View>
  );
}
