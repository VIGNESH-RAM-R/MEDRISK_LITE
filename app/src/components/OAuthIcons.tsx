import Svg, { Path, Rect } from "react-native-svg";

export function GoogleIcon({ size = 18 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <Path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </Svg>
  );
}

export function AppleIcon({ size = 18, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        fill={color}
        d="M13.15 9.53c-.02-1.96 1.6-2.9 1.67-2.95-.91-1.34-2.33-1.52-2.84-1.54-1.21-.12-2.36.71-2.98.71-.62 0-1.56-.7-2.57-.68a3.8 3.8 0 0 0-3.2 1.96c-1.37 2.38-.35 5.9.98 7.83.65.95 1.42 2.01 2.44 1.97 0.98-.04 1.35-.63 2.53-.63 1.18 0 1.51.63 2.54.6 1.05-.02 1.71-.96 2.34-1.91a8.3 8.3 0 0 0 1.06-2.17 3.6 3.6 0 0 1-2.17-3.19z"
      />
      <Path
        fill={color}
        d="M11.32 3.75c.53-.64.88-1.53.78-2.42-.76.03-1.68.51-2.23 1.14-.49.56-.92 1.47-.8 2.33.85.07 1.72-.43 2.25-1.05z"
      />
    </Svg>
  );
}

export function MicrosoftIcon({ size = 18 }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Rect x="0" y="0" width="8.5" height="8.5" fill="#F25022" />
      <Rect x="9.5" y="0" width="8.5" height="8.5" fill="#7FBA00" />
      <Rect x="0" y="9.5" width="8.5" height="8.5" fill="#00A4EF" />
      <Rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#FFB900" />
    </Svg>
  );
}
