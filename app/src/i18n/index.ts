import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import ta from "./locales/ta.json";

export const SUPPORTED_LANGUAGES = ["en", "hi", "ta"] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  hi: "हिंदी",
  ta: "தமிழ்",
};

const STORAGE_KEY = "medrisklite-language";
const DEFAULT_LANGUAGE: LanguageCode = "en";

function isSupported(v: unknown): v is LanguageCode {
  return typeof v === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(v);
}

// English is always the default for a new/unset user — this only overrides it
// once AsyncStorage confirms the person has previously chosen something else.
export async function loadPersistedLanguage(): Promise<LanguageCode> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return isSupported(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export async function setLanguage(lang: LanguageCode): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Non-fatal: the language still applies for this session even if persisting fails.
  }
}

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
