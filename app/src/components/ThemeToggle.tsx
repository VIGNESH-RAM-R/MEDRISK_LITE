import { TouchableOpacity } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useTheme } from "../lib/theme";

function SunIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth={1.8} />
      <Path
        d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MoonIcon({ size = 16, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.5 14.5a8.5 8.5 0 1 1-9-11 6.8 6.8 0 0 0 9 11z"
        fill={color}
      />
    </Svg>
  );
}

export function ThemeToggle({ size = 34 }: { size?: number }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={isDark ? t("common.switchToLightTheme") : t("common.switchToDarkTheme")}
      className="items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: colors.surface2,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {isDark ? <SunIcon color={colors.ink1} /> : <MoonIcon color={colors.ink1} />}
    </TouchableOpacity>
  );
}
