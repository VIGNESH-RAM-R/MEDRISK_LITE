/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v2 registers its own `dark:` variant for native/JS output
  // (resolved at runtime from useColorScheme, not a real CSS media query).
  // Setting `darkMode: "class"` here makes Tailwind's own dark-variant
  // generator collide with NativeWind's, producing a malformed style key
  // that never matches — so `dark:` classes silently do nothing. Leave
  // `darkMode` unset and let NativeWind handle it.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#ACDDDE",
        brand2: "#CAF1DE",
        darkbrand: "#23708A",
        darkbrand2: "#175673",
        amber: "#f59e0b",
        green: "#16a34a",
        red: "#e11d48",
        highlight: "#F7D8B4",
        darkhighlight: "#E37C78",
        onbrand: "#1C3B2E",

        // Light theme surfaces/text (default, unprefixed)
        bg: "#FEF8DD",
        surface: "#E1F8DC",
        surface2: "#FFE7C7",
        border: "#C6DAC2",
        ink1: "rgba(28,59,46,.88)",
        ink2: "rgba(28,59,46,.64)",
        ink3: "rgba(28,59,46,.48)",
        ink4: "rgba(28,59,46,.32)",

        // Dark theme surfaces/text, used via the `dark:` variant
        darkbg: "#2C2C2C",
        darksurface: "#3C3C3C",
        darksurface2: "#323232",
        darkborder: "rgba(255,255,255,.10)",
        darkink1: "rgba(238,241,248,.92)",
        darkink2: "rgba(238,241,248,.65)",
        darkink3: "rgba(238,241,248,.48)",
        darkink4: "rgba(238,241,248,.32)",

        acceptable: "#34d399",
        alarp: "#f59e0b",
        unacceptable: "#fb7185",
      },
      fontFamily: {
        sans: ["PlusJakartaSans_400Regular"],
        "sans-medium": ["PlusJakartaSans_500Medium"],
        "sans-semibold": ["PlusJakartaSans_600SemiBold"],
        "sans-bold": ["PlusJakartaSans_700Bold"],
        "sans-extrabold": ["PlusJakartaSans_800ExtraBold"],
        display: ["Sora_700Bold"],
        "display-black": ["Sora_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
