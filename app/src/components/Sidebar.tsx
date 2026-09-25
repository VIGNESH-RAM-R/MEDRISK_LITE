import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo";
import { translatedViews, type ViewId } from "../lib/constants";
import { useTheme } from "../lib/theme";

export function Sidebar({
  activeView,
  onSelect,
}: {
  activeView: ViewId;
  onSelect: (id: ViewId) => void;
}) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const views = translatedViews(t);

  return (
    <View
      style={{
        width: 248,
        backgroundColor: colors.surface,
        borderRightWidth: 1,
        borderRightColor: colors.border,
      }}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Logo size={30} />
          <View>
            <Text className="font-display" style={{ fontSize: 15, color: colors.ink1 }}>
              {t("sidebar.appName")}
            </Text>
            <Text style={{ fontSize: 10, color: colors.ink3 }}>{t("sidebar.tagline")}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 10.5, color: colors.ink3, marginTop: 14, lineHeight: 15 }}>
          {t("sidebar.standardLine")}
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 12 }} showsVerticalScrollIndicator={false}>
        {views.map((v) => {
          const active = v.id === activeView;
          return (
            <TouchableOpacity
              key={v.id}
              onPress={() => onSelect(v.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 10,
                marginBottom: 4,
                backgroundColor: active ? colors.accentSoft : "transparent",
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  backgroundColor: v.color,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: active ? colors.accentText : undefined,
                  shadowOpacity: active ? 0.5 : 0,
                  shadowRadius: active ? 6 : 0,
                }}
              >
                <Ionicons name={v.icon as any} size={16} color="#fff" />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: active ? "700" : "500",
                  color: active ? colors.accentText : colors.ink2,
                }}
              >
                {v.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 10.5, color: colors.ink4, lineHeight: 15 }}>
          {t("sidebar.dataSavedNote")}
        </Text>
      </View>
    </View>
  );
}
