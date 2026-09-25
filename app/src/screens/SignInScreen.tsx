import { useOAuth, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";
import { Logo } from "../components/Logo";
import { GoogleIcon } from "../components/OAuthIcons";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../lib/theme";

// Recommended by Clerk/Expo docs: pre-warms the in-app browser so the OAuth
// popup opens without the usual first-tap delay on Android. warmUpAsync/
// coolDownAsync aren't implemented on web and throw if called there.
function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

// A slow, gentle back-and-forth loop rather than a one-shot reveal — reads as
// "a live score quietly updating" without being distracting.
function useLoopingValue(from: number, to: number, duration: number): number {
  const animated = useRef(new Animated.Value(from)).current;
  const [value, setValue] = useState(from);
  useEffect(() => {
    const id = animated.addListener(({ value: v }) => setValue(v));
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animated, { toValue: to, duration, useNativeDriver: false }),
        Animated.timing(animated, { toValue: from, duration, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      animated.removeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

function RingBadge() {
  const r = 22;
  const c = 2 * Math.PI * r;
  const pct = useLoopingValue(0.68, 0.76, 2600);
  return (
    <View style={{ width: 52, height: 52, alignItems: "center", justifyContent: "center" }}>
      <Svg width={52} height={52} viewBox="0 0 52 52" style={{ position: "absolute" }}>
        <Circle cx={26} cy={26} r={r} stroke="rgba(255,255,255,.14)" strokeWidth={5} fill="none" />
        <Circle
          cx={26}
          cy={26}
          r={r}
          stroke="#6FD3EC"
          strokeWidth={5}
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 26 26)"
        />
      </Svg>
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "#0d1a2b",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{Math.round(pct * 100)}%</Text>
      </View>
    </View>
  );
}

// Cycles the "highest risk" spotlight through a few real hero entries every
// few seconds, cross-fading between them — a lightweight stand-in for "a
// short looping clip of the dashboard in action" that needs no video asset.
function LiveHighestRisk() {
  const { t } = useTranslation();
  const items = [
    { label: t("signIn.heroHousingCrack"), rpn: 90, classification: "ALARP" as const },
    { label: t("signIn.heroCableStrain"), rpn: 120, classification: "Unacceptable" as const },
    { label: t("signIn.heroSheath"), rpn: 96, classification: "ALARP" as const },
  ];
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: false }).start(() => {
        setIndex((i) => (i + 1) % items.length);
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: false }).start();
      });
    }, 3200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const item = items[index];
  const color = item.classification === "Unacceptable" ? "#fb7185" : "#f59e0b";

  return (
    <Animated.View style={{ opacity }}>
      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700", marginBottom: 6 }}>{item.label}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color, fontSize: 16, fontWeight: "800" }}>RPN {item.rpn}</Text>
        <View style={{ backgroundColor: `${color}2e`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
          <Text style={{ color, fontSize: 9.5, fontWeight: "700" }}>{t(`classification.${item.classification}`)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function LiveDot() {
  const { t } = useTranslation();
  const opacity = useLoopingValue(1, 0.35, 750);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <Animated.View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#6FD3EC", opacity }} />
      <Text style={{ color: "rgba(255,255,255,.35)", fontSize: 9 }}>{t("signIn.heroLive")}</Text>
    </View>
  );
}

function HeroPanel() {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flex: 1,
        padding: 34,
        justifyContent: "space-between",
        backgroundColor: "#0a1220",
      }}
    >
      <View style={{ gap: 14 }}>
        <View
          style={{
            backgroundColor: "rgba(19,26,45,.72)",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,.10)",
            alignSelf: "flex-end",
            width: 190,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "rgba(255,255,255,.7)", fontSize: 10.5, fontWeight: "600" }}>
              {t("signIn.heroComplianceScore")}
            </Text>
            <LiveDot />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <RingBadge />
            <Text style={{ color: "rgba(255,255,255,.5)", fontSize: 10, lineHeight: 14, flex: 1 }}>
              {t("signIn.heroClauseTracker")}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "rgba(19,26,45,.72)",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,.10)",
            width: 210,
            alignSelf: "flex-end",
            marginRight: 40,
          }}
        >
          <Text style={{ color: "rgba(255,255,255,.7)", fontSize: 10.5, fontWeight: "600", marginBottom: 4 }}>
            {t("signIn.heroHighestRisk")}
          </Text>
          <LiveHighestRisk />
        </View>

        <View
          style={{
            backgroundColor: "rgba(19,26,45,.72)",
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,.10)",
            width: 230,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "rgba(255,255,255,.7)", fontSize: 10.5, fontWeight: "600" }}>
              {t("signIn.heroRiskOverview")}
            </Text>
            <Text style={{ color: "rgba(255,255,255,.35)", fontSize: 9 }}>{t("signIn.heroComponentsCount", { count: 9 })}</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 }}>
            {t("signIn.heroFailureModesCount", { count: 15 })}{" "}
            <Text style={{ color: "rgba(255,255,255,.4)", fontSize: 11, fontWeight: "600" }}>{t("signIn.heroFailureModesLabel")}</Text>
          </Text>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "rgba(255,255,255,.55)", fontSize: 10 }}>{t("signIn.heroCableStrain")}</Text>
              <Text style={{ color: "rgba(255,255,255,.8)", fontSize: 10, fontWeight: "700" }}>RPN 120</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "rgba(255,255,255,.55)", fontSize: 10 }}>{t("signIn.heroSheath")}</Text>
              <Text style={{ color: "rgba(255,255,255,.8)", fontSize: 10, fontWeight: "700" }}>RPN 96</Text>
            </View>
          </View>
        </View>
      </View>

      <View>
        <Logo size={38} radius={11} />
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 14, marginBottom: 8, letterSpacing: -0.4 }}>
          {t("signIn.heroHeadline")}
        </Text>
        <Text style={{ color: "rgba(255,255,255,.5)", fontSize: 12, lineHeight: 18, maxWidth: 320 }}>
          {t("signIn.heroBody")}
        </Text>
      </View>
    </View>
  );
}

export function SignInScreen() {
  useWarmUpBrowser();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const showHero = Platform.OS === "web" && width >= 860;

  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: "oauth_google" });

  const [mode, setMode] = useState<"sign-in" | "sign-up" | "verify">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const isWebSsoCallback =
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("sso_callback") === "1";

  const handleGoogle = useCallback(async () => {
    setError(null);
    setGoogleBusy(true);

    // expo-web-browser's openAuthSessionAsync (used internally by useOAuth's
    // startOAuthFlow) is native-only and throws on web. On web, Clerk's own
    // full-page redirect flow is used instead — the browser navigates away
    // and back with ?sso_callback=1, and AuthenticateWithRedirectCallback
    // below completes it and lands back on this exact URL (query stripped).
    if (Platform.OS === "web") {
      try {
        if (!signInLoaded) return;
        const base = `${window.location.origin}${window.location.pathname}`;
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: `${base}?sso_callback=1`,
          redirectUrlComplete: base,
        });
      } catch (e: any) {
        setError(e?.errors?.[0]?.message || t("signIn.googleSignInFailed"));
        setGoogleBusy(false);
      }
      return;
    }

    try {
      const { createdSessionId, setActive } = await startGoogleFlow({
        redirectUrl: Linking.createURL("/"),
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || t("signIn.googleSignInFailed"));
    } finally {
      setGoogleBusy(false);
    }
  }, [signIn, signInLoaded, startGoogleFlow]);

  async function handleSignIn() {
    if (!signInLoaded) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === "complete") {
        await setActiveSignIn({ session: attempt.createdSessionId });
      } else {
        setError(t("signIn.additionalVerificationRequired"));
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || t("signIn.signInFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp() {
    if (!signUpLoaded) return;
    setBusy(true);
    setError(null);
    try {
      // This Clerk instance requires a username, which the UI intentionally
      // doesn't collect (kept minimal to match the reference's email/Google-only
      // login). Derive one from the email's local part so sign-up can complete.
      const localPart = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20) || "user";
      const username = `${localPart}${Math.floor(1000 + Math.random() * 9000)}`;
      await signUp.create({ emailAddress: email, password, username });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verify");
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || t("signIn.signUpFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify() {
    if (!signUpLoaded) return;
    setBusy(true);
    setError(null);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === "complete") {
        await setActiveSignUp({ session: attempt.createdSessionId });
      } else {
        setError(t("signIn.verificationIncomplete"));
      }
    } catch (e: any) {
      setError(e?.errors?.[0]?.message || t("signIn.verificationFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#05080f",
      }}
    >
      {/* Completes the OAuth redirect flow started above, only when the browser
          has actually navigated back from the provider with our marker param —
          mounting this unconditionally makes Clerk bounce every fresh page
          load out to its hosted Account Portal, which is not what we want. */}
      {isWebSsoCallback && (
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl={
            typeof window !== "undefined" ? window.location.origin + window.location.pathname : "/"
          }
          signUpFallbackRedirectUrl={
            typeof window !== "undefined" ? window.location.origin + window.location.pathname : "/"
          }
        />
      )}
      <View
        style={{
          width: "100%",
          maxWidth: 920,
          minHeight: showHero ? 560 : undefined,
          flexDirection: "row",
          borderRadius: 28,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: showHero ? "42%" : "100%",
            padding: 30,
            backgroundColor: colors.surface,
          }}
        >
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center gap-2.5">
              <Logo size={30} />
              <Text
                className="font-display text-[15px]"
                style={{ color: isDark ? "#eef1f8" : "#12172a" }}
              >
                MedRisk Lite
              </Text>
            </View>
            <ThemeToggle size={32} />
          </View>

          <Text
            className="font-display text-[24px] leading-tight"
            style={{ color: isDark ? "#eef1f8" : "#12172a" }}
          >
            {t("signIn.welcomeTitle")}
          </Text>
          <Text
            className="text-[12.5px] mt-2 mb-6 leading-relaxed"
            style={{ color: isDark ? "rgba(238,241,248,.55)" : "#6b7280" }}
          >
            {t("signIn.welcomeSub")}
          </Text>

          {mode !== "verify" && (
            <>
              <TouchableOpacity
                onPress={handleGoogle}
                disabled={googleBusy}
                className="flex-row items-center justify-center rounded-xl py-3 mb-4"
                style={{
                  backgroundColor: colors.surface2,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {googleBusy ? (
                  <ActivityIndicator color="#1f1f1f" />
                ) : (
                  <>
                    <GoogleIcon size={16} />
                    <Text className="text-[13px] ml-2.5 font-sans-semibold" style={{ color: "#1f1f1f" }}>
                      {t("signIn.continueWithGoogle")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center mb-4" style={{ gap: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text className="text-[11px]" style={{ color: colors.ink3 }}>
                  {t("signIn.orContinueWithEmail")}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
            </>
          )}

          {mode !== "verify" ? (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t("signIn.emailPlaceholder")}
                placeholderTextColor={colors.ink4}
                autoCapitalize="none"
                keyboardType="email-address"
                className="rounded-xl px-4 py-3 mb-3"
                style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, color: colors.ink1 }}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t("signIn.passwordPlaceholder")}
                placeholderTextColor={colors.ink4}
                secureTextEntry
                className="rounded-xl px-4 py-3 mb-3"
                style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, color: colors.ink1 }}
              />
            </>
          ) : (
            <>
              <Text className="text-sm mb-3" style={{ color: colors.ink2 }}>
                {t("signIn.verificationSentTo", { email })}
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder={t("signIn.verificationCodePlaceholder")}
                placeholderTextColor={colors.ink4}
                keyboardType="number-pad"
                className="rounded-xl px-4 py-3 mb-3"
                style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, color: colors.ink1 }}
              />
            </>
          )}

          {error ? (
            <Text className="text-[11.5px] mb-3" style={{ color: colors.highlightText }}>
              {error}
            </Text>
          ) : null}

          {/* Required by Clerk's bot-protection CAPTCHA for custom sign-up flows —
              without this mount point it silently fails and signUp.create() never resolves.
              https://clerk.com/docs/guides/development/custom-flows/bot-sign-up-protection */}
          <View nativeID="clerk-captcha" className="mb-3" />

          <TouchableOpacity
            onPress={mode === "sign-in" ? handleSignIn : mode === "sign-up" ? handleSignUp : handleVerify}
            disabled={busy}
            className="rounded-xl py-3 items-center mb-3"
            style={{ backgroundColor: colors.accent }}
          >
            {busy ? (
              <ActivityIndicator color={colors.onAccent} />
            ) : (
              <Text className="font-sans-bold" style={{ color: colors.onAccent }}>
                {mode === "sign-in" ? t("signIn.signIn") : mode === "sign-up" ? t("signIn.createAccount") : t("signIn.verifyEmail")}
              </Text>
            )}
          </TouchableOpacity>

          {mode !== "verify" && (
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              }}
            >
              <Text className="text-xs text-center" style={{ color: colors.ink3 }}>
                {mode === "sign-in" ? t("signIn.noAccount") : t("signIn.haveAccount")}
              </Text>
            </TouchableOpacity>
          )}

          <Text
            className="text-[10px] leading-relaxed mt-6"
            style={{ color: isDark ? "rgba(238,241,248,.35)" : "#9aa1b0" }}
          >
            {t("signIn.footerTagline")}
          </Text>
        </View>

        {showHero && <HeroPanel />}
      </View>
    </View>
  );
}
