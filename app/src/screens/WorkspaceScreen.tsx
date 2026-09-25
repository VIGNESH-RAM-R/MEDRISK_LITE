import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ClassificationBadge } from "../components/Badge";
import { ProbeHotspotDiagram } from "../components/ProbeHotspotDiagram";
import { COMPONENT_META, componentColor, componentName, translatedComponents } from "../lib/constants";
import { computeRpn, classifyRpn } from "../lib/fmea";
import {
  useApiClient,
  type FailureMode,
  type SuggestedFailureMode,
  type SuggestScoresResponse,
} from "../lib/api";
import { useAppStore } from "../store/useAppStore";
import { useTheme } from "../lib/theme";

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View className="items-center mr-4">
      <Text className="text-[11px] text-ink3 dark:text-darkink3 font-sans-semibold mb-1">{label}</Text>
      <View className="flex-row items-center bg-surface2 dark:bg-darksurface2 rounded-xl border border-border dark:border-darkborder">
        <TouchableOpacity
          className="px-3 py-2"
          onPress={() => onChange(Math.max(1, value - 1))}
        >
          <Text className="text-ink2 dark:text-darkink2 font-sans-bold">-</Text>
        </TouchableOpacity>
        <Text className="w-6 text-center font-sans-bold text-ink1 dark:text-darkink1">{value}</Text>
        <TouchableOpacity
          className="px-3 py-2"
          onPress={() => onChange(Math.min(10, value + 1))}
        >
          <Text className="text-ink2 dark:text-darkink2 font-sans-bold">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const emptyForm = {
  componentId: COMPONENT_META[0].id,
  mode: "",
  effect: "",
  cause: "",
  standard: "ISO 14971",
  s: 5,
  o: 5,
  d: 5,
  mitigation: "",
};

function FailureModeForm({
  initial,
  onCancel,
  onSubmit,
  api,
}: {
  initial: typeof emptyForm;
  onCancel: () => void;
  onSubmit: (data: typeof emptyForm) => Promise<void>;
  api: ReturnType<typeof useApiClient>;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [scoreRationale, setScoreRationale] = useState<SuggestScoresResponse["rationale"] | null>(null);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const components = translatedComponents(t);

  const rpn = computeRpn(form.s, form.o, form.d);
  const canUseAi = form.mode.trim().length > 0;

  const handleDraftMitigation = async () => {
    setDraftError(null);
    setDrafting(true);
    try {
      const res = await api.draftMitigation({
        componentId: form.componentId,
        mode: form.mode,
        effect: form.effect,
        cause: form.cause,
      });
      setForm((f) => ({ ...f, mitigation: res.mitigation }));
    } catch (e: any) {
      setDraftError(e?.message || t("workspace.draftMitigationError"));
    } finally {
      setDrafting(false);
    }
  };

  const handleSuggestScores = async () => {
    setScoreError(null);
    setScoring(true);
    try {
      const res = await api.suggestScores({
        componentId: form.componentId,
        mode: form.mode,
        effect: form.effect,
        cause: form.cause,
      });
      setForm((f) => ({ ...f, s: res.s, o: res.o, d: res.d }));
      setScoreRationale(res.rationale);
    } catch (e: any) {
      setScoreError(e?.message || t("workspace.suggestScoresError"));
    } finally {
      setScoring(false);
    }
  };

  return (
    <View className="bg-surface2 dark:bg-darksurface2 border border-border dark:border-darkborder rounded-2xl p-4 mb-4">
      <Text className="text-[11px] font-sans-bold text-ink3 dark:text-darkink3 mb-2 tracking-wide">{t("workspace.componentLabel")}</Text>
      <View className="flex-row flex-wrap gap-2 mb-3">
        {components.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setForm({ ...form, componentId: c.id })}
            className="px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: form.componentId === c.id ? c.color : colors.surface,
              borderColor: c.color,
            }}
          >
            <Text
              className="text-xs font-sans-bold"
              style={{ color: form.componentId === c.id ? "white" : c.color }}
            >
              {c.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder={t("workspace.placeholderMode")}
        placeholderTextColor={colors.ink4}
        value={form.mode}
        onChangeText={(v) => setForm({ ...form, mode: v })}
        className="bg-surface dark:bg-darksurface border border-border dark:border-darkborder rounded-xl px-3 py-2 mb-2 text-ink1 dark:text-darkink1"
      />
      <TextInput
        placeholder={t("workspace.placeholderEffect")}
        placeholderTextColor={colors.ink4}
        value={form.effect}
        onChangeText={(v) => setForm({ ...form, effect: v })}
        className="bg-surface dark:bg-darksurface border border-border dark:border-darkborder rounded-xl px-3 py-2 mb-2 text-ink1 dark:text-darkink1"
      />
      <TextInput
        placeholder={t("workspace.placeholderCause")}
        placeholderTextColor={colors.ink4}
        value={form.cause}
        onChangeText={(v) => setForm({ ...form, cause: v })}
        className="bg-surface dark:bg-darksurface border border-border dark:border-darkborder rounded-xl px-3 py-2 mb-2 text-ink1 dark:text-darkink1"
      />
      <TextInput
        placeholder={t("workspace.placeholderStandard")}
        placeholderTextColor={colors.ink4}
        value={form.standard}
        onChangeText={(v) => setForm({ ...form, standard: v })}
        className="bg-surface dark:bg-darksurface border border-border dark:border-darkborder rounded-xl px-3 py-2 mb-2 text-ink1 dark:text-darkink1"
      />
      <TextInput
        placeholder={t("workspace.placeholderMitigation")}
        placeholderTextColor={colors.ink4}
        value={form.mitigation}
        onChangeText={(v) => setForm({ ...form, mitigation: v })}
        multiline
        className="bg-surface dark:bg-darksurface border border-border dark:border-darkborder rounded-xl px-3 py-2 mb-1 text-ink1 dark:text-darkink1"
      />
      <TouchableOpacity
        disabled={!canUseAi || drafting}
        onPress={handleDraftMitigation}
        className="self-start mb-1"
      >
        <Text
          className="text-[11px] font-sans-bold"
          style={{ color: !canUseAi ? colors.ink4 : colors.accentText }}
        >
          {drafting ? t("workspace.drafting") : t("workspace.draftMitigation")}
        </Text>
      </TouchableOpacity>
      {draftError && (
        <Text className="text-[10.5px] mb-2" style={{ color: "#fb7185" }}>
          {draftError}
        </Text>
      )}
      {!draftError && <View className="mb-2" />}

      <View className="flex-row items-center mb-1">
        <Stepper label="S" value={form.s} onChange={(v) => setForm({ ...form, s: v })} />
        <Stepper label="O" value={form.o} onChange={(v) => setForm({ ...form, o: v })} />
        <Stepper label="D" value={form.d} onChange={(v) => setForm({ ...form, d: v })} />
        <Text className="text-ink1 dark:text-darkink1 font-sans-extrabold ml-2">{t("workspace.rpnLabel", { value: rpn })}</Text>
      </View>
      <TouchableOpacity
        disabled={!canUseAi || scoring}
        onPress={handleSuggestScores}
        className="self-start mb-1"
      >
        <Text
          className="text-[11px] font-sans-bold"
          style={{ color: !canUseAi ? colors.ink4 : colors.accentText }}
        >
          {scoring ? t("workspace.thinking") : t("workspace.suggestScores")}
        </Text>
      </TouchableOpacity>
      {scoreError && (
        <Text className="text-[10.5px] mb-2" style={{ color: "#fb7185" }}>
          {scoreError}
        </Text>
      )}
      {scoreRationale && !scoreError && (
        <View
          className="rounded-xl p-2.5 mb-2"
          style={{ backgroundColor: colors.accentSoft }}
        >
          <Text className="text-[10.5px] mb-1" style={{ color: colors.ink2 }}>
            <Text className="font-sans-bold">{t("workspace.rationaleS")}</Text>
            {scoreRationale.s}
          </Text>
          <Text className="text-[10.5px] mb-1" style={{ color: colors.ink2 }}>
            <Text className="font-sans-bold">{t("workspace.rationaleO")}</Text>
            {scoreRationale.o}
          </Text>
          <Text className="text-[10.5px]" style={{ color: colors.ink2 }}>
            <Text className="font-sans-bold">{t("workspace.rationaleD")}</Text>
            {scoreRationale.d}
          </Text>
        </View>
      )}

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 items-center py-2.5 rounded-xl border border-border dark:border-darkborder"
        >
          <Text className="text-ink2 dark:text-darkink2 font-sans-semibold">{t("common.cancel")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={saving || !form.mode.trim()}
          onPress={async () => {
            setSaving(true);
            await onSubmit(form);
            setSaving(false);
          }}
          className="flex-1 items-center py-2.5 rounded-xl bg-brand dark:bg-darkbrand"
        >
          <Text className="text-onbrand dark:text-white font-sans-bold">{saving ? t("common.saving") : t("common.save")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function WorkspaceScreen() {
  const api = useApiClient();
  const { failureModes, workspace, addFailureMode, updateFailureMode, deleteFailureMode, toggleSheath } =
    useAppStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterComponent, setFilterComponent] = useState<string | null>(null);
  const [aiComponent, setAiComponent] = useState(COMPONENT_META[0].id);
  const [suggestions, setSuggestions] = useState<SuggestedFailureMode[]>([]);
  const [suggestSource, setSuggestSource] = useState<"ai" | "fallback" | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const components = translatedComponents(t);

  const settings = {
    alarpFrom: workspace?.alarpFrom ?? 50,
    unacceptableFrom: workspace?.unacceptableFrom ?? 100,
  };

  const visible = filterComponent
    ? failureModes.filter((fm) => fm.componentId === filterComponent)
    : failureModes;

  const fetchSuggestions = async (componentId: string) => {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const res = await api.suggestFailureModes(componentId);
      setSuggestions(res.suggestions);
      setSuggestSource(res.source);
      if (res.source === "fallback" && res.error) {
        setSuggestError(res.error);
      }
    } catch (e: any) {
      setSuggestions([]);
      setSuggestSource(null);
      setSuggestError(e?.message || t("workspace.suggestLoadError"));
    } finally {
      setSuggestLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-bg dark:bg-darkbg px-4 pt-4">
      <View className="flex-row flex-wrap mb-4" style={{ gap: 14 }}>
        <View
          className="rounded-2xl p-4"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: 280 }}
        >
          <Text className="font-sans-bold text-[13px] mb-1" style={{ color: colors.ink1 }}>
            {t("workspace.probeMappingTitle")}
          </Text>
          <Text style={{ fontSize: 11, color: colors.ink3, marginBottom: 8 }}>
            {t("workspace.probeMappingSub")}
          </Text>
          <ProbeHotspotDiagram
            sheathApplied={workspace?.sheathApplied ?? true}
            selected={filterComponent}
            onSelect={(id) => setFilterComponent(filterComponent === id ? null : id)}
          />
          <View className="flex-row items-center justify-between mt-3">
            <Text className="font-sans-semibold text-[12px]" style={{ color: colors.ink2 }}>
              {t("workspace.sheathLabel")}
            </Text>
            <TouchableOpacity
              onPress={() => toggleSheath(api)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: workspace?.sheathApplied ? "rgba(52,211,153,.14)" : "rgba(251,113,133,.14)",
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: workspace?.sheathApplied ? "#34d399" : "#fb7185",
                }}
              >
                {workspace?.sheathApplied ? t("workspace.sheathYes") : t("workspace.sheathNo")}
              </Text>
            </TouchableOpacity>
          </View>
          {filterComponent && (
            <TouchableOpacity
              onPress={() => setFilterComponent(null)}
              style={{ marginTop: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surface2, alignItems: "center" }}
            >
              <Text style={{ fontSize: 11.5, fontWeight: "600", color: colors.ink2 }}>
                {t("workspace.clearFilter", { component: componentName(filterComponent, t) })}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          className="rounded-2xl p-4"
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flex: 1, minWidth: 280 }}
        >
          <Text className="font-sans-bold text-[14px] mb-1" style={{ color: colors.ink1 }}>
            {t("workspace.suggestTitle")}
          </Text>
          <Text style={{ fontSize: 12, color: colors.ink3, marginBottom: 8 }}>
            {t("workspace.suggestSub")}
          </Text>
          <View className="flex-row flex-wrap mb-2" style={{ gap: 6 }}>
            {components.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => {
                  setAiComponent(c.id);
                  setSuggestions([]);
                  setSuggestSource(null);
                  setSuggestError(null);
                }}
                style={{
                  paddingHorizontal: 9,
                  paddingVertical: 5,
                  borderRadius: 999,
                  backgroundColor: aiComponent === c.id ? c.color : colors.surface2,
                  borderWidth: 1,
                  borderColor: c.color,
                }}
              >
                <Text style={{ fontSize: 10.5, fontWeight: "700", color: aiComponent === c.id ? "#fff" : c.color }}>
                  {c.id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            disabled={suggestLoading}
            onPress={() => fetchSuggestions(aiComponent)}
            style={{
              alignSelf: "flex-start",
              backgroundColor: colors.accentSoft,
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            {suggestLoading && <ActivityIndicator size="small" color={colors.accentText} />}
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accentText }}>
              {suggestLoading ? t("workspace.generating") : t("workspace.generateFor", { component: aiComponent })}
            </Text>
          </TouchableOpacity>

          {suggestError && (
            <Text style={{ fontSize: 12, color: "#fb7185", marginBottom: 8 }}>{suggestError}</Text>
          )}
          {suggestSource === "fallback" && !suggestError && (
            <Text style={{ fontSize: 11.5, color: colors.ink4, marginBottom: 8 }}>
              {t("workspace.suggestFallbackNote")}
            </Text>
          )}

          {!suggestLoading && suggestions.length === 0 && !suggestError && (
            <Text style={{ fontSize: 12.5, color: colors.ink4 }}>
              {t("workspace.suggestEmpty")}
            </Text>
          )}

          {suggestions.map((s, i) => (
            <View
              key={i}
              style={{
                backgroundColor: colors.accentSoft,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: "700", color: colors.ink1, marginBottom: 5 }}>{s.mode}</Text>
              {s.rationale && (
                <Text style={{ fontSize: 12.5, lineHeight: 18, color: colors.ink2, marginBottom: 10, fontStyle: "italic" }}>
                  {s.rationale}
                </Text>
              )}
              <TouchableOpacity
                onPress={async () => {
                  await addFailureMode(api, {
                    componentId: aiComponent,
                    mode: s.mode,
                    effect: t("workspace.pendingReview"),
                    cause: s.rationale || t("workspace.pendingReview"),
                    standard: t("workspace.suggestedEntryStandard"),
                    s: 5,
                    o: 5,
                    d: 5,
                    mitigation: t("workspace.pendingReviewMitigation"),
                  });
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.accentText }}>{t("workspace.addToWorkspace")}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-ink1 dark:text-darkink1 font-sans-bold text-[15px]">{t("workspace.documentedTitle")}</Text>
        <TouchableOpacity
          onPress={() => setAdding((a) => !a)}
          className="rounded-xl px-4 py-2"
          style={{ backgroundColor: colors.accent }}
        >
          <Text style={{ color: colors.onAccent }} className="font-sans-bold text-[12.5px]">
            {adding ? t("workspace.closeForm") : t("workspace.addFailureMode")}
          </Text>
        </TouchableOpacity>
      </View>

      {adding && (
        <FailureModeForm
          initial={emptyForm}
          api={api}
          onCancel={() => setAdding(false)}
          onSubmit={async (data) => {
            await addFailureMode(api, data);
            setAdding(false);
          }}
        />
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <TouchableOpacity
          onPress={() => setFilterComponent(null)}
          className="px-3 py-1.5 rounded-full border mr-2"
          style={{
            backgroundColor: filterComponent === null ? colors.tabActive : colors.surface,
            borderColor: colors.tabActive,
          }}
        >
          <Text
            className="text-xs font-sans-bold"
            style={{
              color:
                filterComponent === null ? (isDark ? "#0a1220" : "#ffffff") : colors.tabActive,
            }}
          >
            {t("classification.All")}
          </Text>
        </TouchableOpacity>
        {components.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setFilterComponent(c.id)}
            className="px-3 py-1.5 rounded-full border mr-2"
            style={{
              backgroundColor: filterComponent === c.id ? c.color : colors.surface,
              borderColor: c.color,
            }}
          >
            <Text
              className="text-xs font-sans-bold"
              style={{ color: filterComponent === c.id ? "white" : c.color }}
            >
              {c.id}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {visible.map((fm) =>
        editingId === fm.id ? (
          <FailureModeForm
            key={fm.id}
            initial={{
              componentId: fm.componentId,
              mode: fm.mode,
              effect: fm.effect,
              cause: fm.cause,
              standard: fm.standard,
              s: fm.s,
              o: fm.o,
              d: fm.d,
              mitigation: fm.mitigation,
            }}
            api={api}
            onCancel={() => setEditingId(null)}
            onSubmit={async (data) => {
              await updateFailureMode(api, fm.id, data);
              setEditingId(null);
            }}
          />
        ) : (
          <FailureModeCard
            key={fm.id}
            fm={fm}
            settings={settings}
            onEdit={() => setEditingId(fm.id)}
            onDelete={() => deleteFailureMode(api, fm.id)}
            onScoreChange={(s, o, d) => updateFailureMode(api, fm.id, { s, o, d })}
          />
        )
      )}

      {visible.length === 0 && !adding && (
        <Text className="text-ink3 dark:text-darkink3 text-sm text-center mt-8">
          {t("workspace.noFilterResults")}
        </Text>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}

function FailureModeCard({
  fm,
  settings,
  onEdit,
  onDelete,
  onScoreChange,
}: {
  fm: FailureMode;
  settings: { alarpFrom: number; unacceptableFrom: number };
  onEdit: () => void;
  onDelete: () => void;
  onScoreChange: (s: number, o: number, d: number) => void;
}) {
  const rpn = computeRpn(fm.s, fm.o, fm.d);
  const classification = classifyRpn(rpn, settings);
  const { t } = useTranslation();

  return (
    <View
      className="bg-surface dark:bg-darksurface rounded-2xl border border-border dark:border-darkborder p-4 mb-3"
      style={{ shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 2 }}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-2 mb-1">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: componentColor(fm.componentId) }}
            />
            <Text className="text-ink3 dark:text-darkink3 text-xs">{componentName(fm.componentId, t)}</Text>
          </View>
          <Text className="text-ink1 dark:text-darkink1 font-sans-bold">{fm.mode}</Text>
        </View>
        <ClassificationBadge value={classification} />
      </View>

      <Text className="text-ink2 dark:text-darkink2 text-xs mb-1">
        <Text className="font-sans-semibold">{t("workspace.effectLabel")}</Text>
        {fm.effect || "—"}
      </Text>
      <Text className="text-ink2 dark:text-darkink2 text-xs mb-1">
        <Text className="font-sans-semibold">{t("workspace.causeLabel")}</Text>
        {fm.cause || "—"}
      </Text>
      <Text className="text-ink2 dark:text-darkink2 text-xs mb-3">
        <Text className="font-sans-semibold">{t("workspace.mitigationLabel")}</Text>
        {fm.mitigation || "—"}
      </Text>

      <View className="flex-row items-center mb-3">
        <Stepper label="S" value={fm.s} onChange={(v) => onScoreChange(v, fm.o, fm.d)} />
        <Stepper label="O" value={fm.o} onChange={(v) => onScoreChange(fm.s, v, fm.d)} />
        <Stepper label="D" value={fm.d} onChange={(v) => onScoreChange(fm.s, fm.o, v)} />
        <Text className="text-ink1 dark:text-darkink1 font-sans-extrabold ml-2">{t("workspace.rpnLabel", { value: rpn })}</Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-ink4 dark:text-darkink4 text-[11px]">
          {t("workspace.updatedAt", { date: new Date(fm.updatedAt).toLocaleString() })}
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={onEdit}>
            <Text className="font-sans-bold text-xs" style={{ color: "#0891b2" }}>
              {t("common.edit")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete}>
            <Text className="font-sans-bold text-xs" style={{ color: "#fb7185" }}>
              {t("common.delete")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
