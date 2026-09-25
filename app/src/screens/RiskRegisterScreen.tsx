import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ClassificationBadge } from "../components/Badge";
import { componentName } from "../lib/constants";
import { useAppStore } from "../store/useAppStore";
import { useTheme } from "../lib/theme";

type SortKey = "id" | "component" | "s" | "o" | "d" | "rpn";

const FILTERS = ["All", "Acceptable", "ALARP", "Unacceptable"] as const;

export function RiskRegisterScreen() {
  const { failureModes } = useAppStore();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sortKey, setSortKey] = useState<SortKey>("rpn");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const rows = useMemo(() => {
    let list = failureModes.map((f) => ({ f, comp: componentName(f.componentId, t) }));
    if (filter !== "All") list = list.filter((r) => r.f.classification === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => (r.f.mode + r.comp).toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const va = sortKey === "component" ? a.comp : sortKey === "id" ? a.f.id : sortKey === "rpn" ? a.f.rpn : a.f[sortKey];
      const vb = sortKey === "component" ? b.comp : sortKey === "id" ? b.f.id : sortKey === "rpn" ? b.f.rpn : b.f[sortKey];
      return (va > vb ? 1 : va < vb ? -1 : 0) * sortDir;
    });
    return list;
  }, [failureModes, filter, search, sortKey, sortDir, t]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  const columns: { key: SortKey | "mode" | "badge"; label: string; width: number; sortable?: boolean }[] = [
    { key: "id", label: t("register.columnId"), width: 40, sortable: true },
    { key: "component", label: t("register.columnComponent"), width: 210, sortable: true },
    { key: "mode", label: t("register.columnMode"), width: 230 },
    { key: "s", label: t("register.columnS"), width: 36, sortable: true },
    { key: "o", label: t("register.columnO"), width: 36, sortable: true },
    { key: "d", label: t("register.columnD"), width: 36, sortable: true },
    { key: "rpn", label: t("register.columnRpn"), width: 50, sortable: true },
    { key: "badge", label: t("register.columnAlarp"), width: 110 },
  ];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg, padding: 20 }}>
      <View
        className="flex-row items-center flex-wrap rounded-2xl p-3 mb-4"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 10 }}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("register.searchPlaceholder")}
          placeholderTextColor={colors.ink4}
          style={{
            backgroundColor: colors.surface2,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: colors.ink1,
            minWidth: 220,
            flexGrow: 1,
          }}
        />
        <View className="flex-row flex-wrap" style={{ gap: 6, marginLeft: "auto" }}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: filter === f ? colors.accent : colors.surface2,
                borderWidth: 1,
                borderColor: filter === f ? "transparent" : colors.border,
              }}
            >
              <Text style={{ fontSize: 11.5, fontWeight: "700", color: filter === f ? colors.onAccent : colors.ink2 }}>
                {t(`classification.${f}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        className="rounded-2xl flex-1"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View className="flex-row" style={{ backgroundColor: colors.surface2 }}>
              {columns.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  disabled={!c.sortable}
                  onPress={() => c.sortable && toggleSort(c.key as SortKey)}
                  style={{ width: c.width, paddingHorizontal: 10, paddingVertical: 10 }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: sortKey === c.key ? colors.accentText : colors.ink2,
                    }}
                  >
                    {c.label}
                    {c.sortable && sortKey === c.key ? (sortDir === 1 ? " ▲" : " ▼") : ""}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView>
              {rows.map(({ f, comp }, i) => (
                <View
                  key={f.id}
                  className="flex-row items-center"
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    backgroundColor: i % 2 === 0 ? "transparent" : colors.surface2,
                  }}
                >
                  <View style={{ width: 40, padding: 10 }}>
                    <Text style={{ fontSize: 11, color: colors.ink3 }} numberOfLines={1}>
                      {i + 1}
                    </Text>
                  </View>
                  <View style={{ width: 210, padding: 10 }}>
                    <Text style={{ fontSize: 11.5, fontWeight: "600", color: colors.ink1 }} numberOfLines={2}>
                      {comp}
                    </Text>
                  </View>
                  <View style={{ width: 230, padding: 10 }}>
                    <Text style={{ fontSize: 11.5, color: colors.ink1 }} numberOfLines={2}>
                      {f.mode}
                    </Text>
                  </View>
                  <View style={{ width: 36, padding: 10 }}>
                    <Text style={{ fontSize: 11.5, color: colors.ink2 }}>{f.s}</Text>
                  </View>
                  <View style={{ width: 36, padding: 10 }}>
                    <Text style={{ fontSize: 11.5, color: colors.ink2 }}>{f.o}</Text>
                  </View>
                  <View style={{ width: 36, padding: 10 }}>
                    <Text style={{ fontSize: 11.5, color: colors.ink2 }}>{f.d}</Text>
                  </View>
                  <View style={{ width: 50, padding: 10 }}>
                    <Text style={{ fontSize: 12.5, fontWeight: "800", color: colors.ink1 }}>{f.rpn}</Text>
                  </View>
                  <View style={{ width: 110, padding: 10 }}>
                    <ClassificationBadge value={f.classification} />
                  </View>
                </View>
              ))}
              {rows.length === 0 && (
                <View style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: colors.ink3, fontSize: 12.5 }}>{t("register.noMatches")}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
