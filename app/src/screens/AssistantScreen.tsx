import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import { useApiClient, type ChatMessage } from "../lib/api";
import { useTheme } from "../lib/theme";

type Message = { id: string; role: "user" | "assistant"; text: string; error?: boolean };
type PendingFile = { name: string; uri: string; mimeType: string };

const TEXTY = /\.(txt|csv|md|json|log)$/i;

function isWebSpeechAvailable() {
  return (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    Boolean((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)
  );
}

export function AssistantScreen() {
  const api = useApiClient();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const quickPrompts = t("assistant.quickPrompts", { returnObjects: true }) as string[];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: t("assistant.welcomeMessage"),
    },
  ]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);

  async function pickFiles() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "text/plain", "text/csv", "application/json", "application/pdf"],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;
    setPendingFiles((prev) => [
      ...prev,
      ...result.assets.map((a) => ({ name: a.name, uri: a.uri, mimeType: a.mimeType || "" })),
    ]);
  }

  async function readFileContext(files: PendingFile[]) {
    const summaries: string[] = [];
    let contextText = "";
    for (const f of files) {
      if (f.mimeType.startsWith("image/")) {
        summaries.push(t("common.attachedPhoto", { name: f.name }));
        continue;
      }
      if (f.mimeType === "application/pdf" || /\.pdf$/i.test(f.name)) {
        summaries.push(t("common.attachedPdfNoPreview", { name: f.name }));
        continue;
      }
      if (f.mimeType.startsWith("text/") || f.mimeType === "application/json" || TEXTY.test(f.name)) {
        try {
          const text = await (await fetch(f.uri)).text();
          contextText += `\n\nAttached file "${f.name}":\n${text.slice(0, 4000)}`;
          summaries.push(t("common.attachedFile", { name: f.name }));
        } catch {
          summaries.push(t("common.attachedFileUnreadable", { name: f.name }));
        }
        continue;
      }
      summaries.push(t("common.attachedFile", { name: f.name }));
    }
    return { summaries, contextText };
  }

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text && pendingFiles.length === 0) return;
    const files = pendingFiles;
    setPendingFiles([]);
    setInput("");

    const { summaries, contextText } = await readFileContext(files);
    const displayText = text + (summaries.length ? "\n" + summaries.join(" · ") : "");
    const outgoingText = text + contextText;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: displayText };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    try {
      const { reply } = await api.sendChatMessage(
        outgoingText || "(no text, see attached files)",
        history,
        i18n.language
      );
      setHistory((h) => [...h, { role: "user", text: outgoingText }, { role: "assistant", text: reply }]);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", text: reply }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", text: t("assistant.errorPrefix", { message: e.message }), error: true },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }

  function toggleMic() {
    if (!isWebSpeechAvailable()) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e: any) => {
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  }

  const micAvailable = isWebSpeechAvailable();

  return (
    <View className="flex-1 flex-row" style={{ backgroundColor: colors.bg }}>
      <View
        className="p-4"
        style={{ width: 220, borderRightWidth: 1, borderRightColor: colors.border, display: Platform.OS === "web" ? "flex" : "none" }}
      >
        <Text className="font-sans-bold text-[13px] mb-3" style={{ color: colors.ink1 }}>
          {t("assistant.quickPromptsTitle")}
        </Text>
        {quickPrompts.map((q) => (
          <TouchableOpacity
            key={q}
            onPress={() => send(q)}
            style={{
              backgroundColor: colors.surface2,
              borderRadius: 10,
              padding: 10,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 11.5, color: colors.ink2 }}>{q}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => {
            setMessages([]);
            setHistory([]);
          }}
          style={{ marginTop: "auto", paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: colors.ink3 }}>{t("assistant.clearConversation")}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="px-4 pt-4 pb-2 flex-row items-center" style={{ gap: 10 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.onAccent, fontWeight: "800", fontSize: 11 }}>AI</Text>
          </View>
          <View>
            <Text className="font-display text-[16px]" style={{ color: colors.ink1 }}>{t("assistant.assistantName")}</Text>
            <Text style={{ fontSize: 10.5, color: colors.ink3 }}>{t("assistant.assistantSubtitle")}</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) =>
            m.role === "user" ? (
              <View
                key={m.id}
                className="mb-3 max-w-[85%] rounded-2xl px-4 py-3 self-end"
                style={{ backgroundColor: colors.accent, borderBottomRightRadius: 4 }}
              >
                <Text style={{ color: colors.onAccent }} className="font-sans-medium">{m.text}</Text>
              </View>
            ) : (
              <View
                key={m.id}
                className="mb-3 max-w-[85%] rounded-2xl px-4 py-3 self-start bg-surface2 dark:bg-darksurface2 border"
                style={{ borderBottomLeftRadius: 4, borderColor: m.error ? colors.highlight : colors.border }}
              >
                <Text style={{ color: colors.ink1 }}>{m.text}</Text>
              </View>
            )
          )}
          {sending && (
            <View
              className="self-start bg-surface2 dark:bg-darksurface2 border border-border dark:border-darkborder rounded-2xl px-4 py-3 mb-3"
              style={{ borderBottomLeftRadius: 4 }}
            >
              <Text style={{ color: colors.ink3 }}>{t("assistant.typing")}</Text>
            </View>
          )}
          <View className="h-4" />
        </ScrollView>

        {pendingFiles.length > 0 && (
          <View className="px-4 flex-row flex-wrap" style={{ gap: 6 }}>
            {pendingFiles.map((f, i) => (
              <View
                key={i}
                className="flex-row items-center"
                style={{ backgroundColor: colors.surface2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, gap: 6 }}
              >
                <Text style={{ fontSize: 11, color: colors.ink2 }}>
                  {f.mimeType.startsWith("image/") ? "📷" : "📄"} {f.name}
                </Text>
                <TouchableOpacity onPress={() => setPendingFiles((p) => p.filter((_, idx) => idx !== i))}>
                  <Text style={{ color: colors.ink4 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row items-center px-4 py-3 border-t border-border dark:border-darkborder bg-surface dark:bg-darksurface" style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={pickFiles}
            style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2 }}
          >
            <Text style={{ fontSize: 16 }}>📎</Text>
          </TouchableOpacity>
          {micAvailable && (
            <TouchableOpacity
              onPress={toggleMic}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: listening ? colors.highlight : colors.surface2,
              }}
            >
              <Text style={{ fontSize: 16 }}>🎤</Text>
            </TouchableOpacity>
          )}
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            placeholder={t("assistant.inputPlaceholder")}
            placeholderTextColor={colors.ink4}
            className="flex-1 bg-surface2 dark:bg-darksurface2 border border-border dark:border-darkborder rounded-xl px-4 py-2.5"
            style={{ color: colors.ink1 }}
          />
          <TouchableOpacity onPress={() => send()} className="rounded-xl px-4 py-2.5" style={{ backgroundColor: colors.accent }}>
            <Text style={{ color: colors.onAccent }} className="font-sans-bold">{t("assistant.send")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
