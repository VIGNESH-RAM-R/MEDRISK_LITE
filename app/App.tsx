import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { NativeWindStyleSheet } from "nativewind";

// Required so the OAuth browser popup closes and returns control to the app
// once the provider redirects back after a Google/Apple/Microsoft sign-in.
WebBrowser.maybeCompleteAuthSession();

// NativeWind v2 auto-detects "css" output on react-native-web, assuming a
// Webpack/PostCSS pipeline generates real Tailwind CSS. Expo's Metro web
// target has no such pipeline, so classNames were passed straight through
// to the DOM with nothing backing them. Forcing "native" output makes
// NativeWind compute styles from JS (as it already does on iOS/Android)
// on web too.
NativeWindStyleSheet.setOutput({ default: "native" });
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Sora_700Bold, Sora_800ExtraBold } from "@expo-google-fonts/sora";
import { tokenCache } from "./src/lib/tokenCache";
import { SignInScreen } from "./src/screens/SignInScreen";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useTheme } from "./src/lib/theme";
import i18n, { loadPersistedLanguage, setLanguage } from "./src/i18n";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — copy .env.example to .env and fill in your Clerk publishable key."
  );
}

// ============================================================================
// ⚠️ TEMPORARY AUTH BYPASS — set EXPO_PUBLIC_BYPASS_AUTH=true in app/.env to
// skip the Clerk sign-in gate entirely while the Google OAuth redirect issue
// is being worked out. The matching BYPASS_AUTH flag must also be set in
// server/.env, since the backend independently enforces the Clerk session too
// — bypassing only this gate would just land on a "couldn't load" error.
// Email/password sign-in is untouched and still works normally when this is off.
// To re-enable the real auth gate: remove EXPO_PUBLIC_BYPASS_AUTH from app/.env
// (or set it to anything other than "true").
// ============================================================================
const BYPASS_AUTH = process.env.EXPO_PUBLIC_BYPASS_AUTH === "true";
if (BYPASS_AUTH) {
  console.warn("⚠️  EXPO_PUBLIC_BYPASS_AUTH is enabled — the sign-in gate is skipped.");
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  const [ready, setReady] = useState(false);
  const [langLoaded, setLangLoaded] = useState(false);
  useEffect(() => {
    // English is the default for a new/unset user; this only switches away
    // from it once AsyncStorage confirms a previously-saved language choice.
    loadPersistedLanguage().then((lang) => {
      if (lang !== i18n.language) return setLanguage(lang).finally(() => setLangLoaded(true));
      setLangLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded && langLoaded) {
      setReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, langLoaded]);

  if (!ready) return null;

  return (
    <ClerkProvider
      publishableKey={publishableKey ?? ""}
      tokenCache={tokenCache}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
    >
      <AppShell />
    </ClerkProvider>
  );
}

function AppShell() {
  const { isDark } = useTheme();

  if (BYPASS_AUTH) {
    return (
      <>
        <StatusBar style={isDark ? "light" : "dark"} />
        <RootNavigator />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SignedIn>
        <RootNavigator />
      </SignedIn>
      <SignedOut>
        <SignInScreen />
      </SignedOut>
    </>
  );
}
