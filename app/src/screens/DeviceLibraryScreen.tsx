import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../store/useAppStore";
import { translatedComponents, type ViewId } from "../lib/constants";
import { useTheme } from "../lib/theme";

type FutureDevice = { name: string; note: string };

export function DeviceLibraryScreen({ navigate }: { navigate: (v: ViewId) => void }) {
  const { failureModes } = useAppStore();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const components = translatedComponents(t);
  const futureDevices = t("futureDevices", { returnObjects: true }) as FutureDevice[];

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20 }}>
      <View
        className="rounded-2xl p-5 mb-5"
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.accent + "59",
        }}
      >
        <View className="flex-row items-center justify-between flex-wrap" style={{ gap: 12 }}>
          <View className="flex-row items-center gap-3">
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.accent,
              }}
            >
              <Text style={{ color: colors.onAccent, fontWeight: "800", fontSize: 13 }}>US</Text>
            </View>
            <View>
              <Text className="font-sans-bold text-[15px]" style={{ color: colors.ink1 }}>
                {t("library.activeDeviceName")}
              </Text>
              <Text style={{ fontSize: 12, color: colors.ink3 }}>
                {t("library.activeDeviceMeta", { components: components.length, modes: failureModes.length })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigate("workspace")}
            style={{ backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 }}
          >
            <Text style={{ color: colors.onAccent, fontWeight: "700", fontSize: 12.5 }}>{t("library.openWorkspace")}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-3 mt-4">
          {components.map((c) => (
            <View
              key={c.id}
              style={{
                width: "31%",
                minWidth: 200,
                flexGrow: 1,
                borderRadius: 10,
                padding: 12,
                backgroundColor: colors.surface2,
              }}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.color }} />
                <Text className="font-sans-bold text-[12px]" style={{ color: colors.ink1 }}>
                  {c.name}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.ink3 }}>{c.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text
        className="font-sans-bold uppercase"
        style={{ fontSize: 11.5, color: colors.ink3, letterSpacing: 0.5, marginBottom: 8 }}
      >
        {t("library.comingSoonHeader")}
      </Text>
      <View className="flex-row flex-wrap gap-4">
        {futureDevices.map((d) => (
          <View
            key={d.name}
            style={{
              width: "31%",
              minWidth: 220,
              flexGrow: 1,
              borderRadius: 16,
              padding: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: 0.6,
            }}
          >
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "700", color: colors.ink3 }}>{t("library.comingSoonBadge")}</Text>
            </View>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                backgroundColor: colors.surface2,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: colors.ink4, fontWeight: "800" }}>--</Text>
            </View>
            <Text className="font-sans-bold text-[13px]" style={{ color: colors.ink1 }}>
              {d.name}
            </Text>
            <Text style={{ fontSize: 11.5, color: colors.ink3, marginTop: 4 }}>{d.note}</Text>
            <Text style={{ fontSize: 11, color: colors.ink4, marginTop: 6, fontStyle: "italic" }}>
              {t("library.comingSoonNote")}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
