import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

// Wireless handheld ultrasound probe mark: transducer head + grip ridges,
// wifi-style emission arcs above, coiled cable below — matching the
// MedRisk Lite brand tile.
export function Logo({ size = 32, radius = 9 }: { size?: number; radius?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#23708A" />
          <Stop offset="1" stopColor="#175673" />
        </LinearGradient>
      </Defs>
      <Rect width={32} height={32} rx={radius} fill="url(#logoGrad)" />

      {/* Wireless emission arcs, fanning above the probe head */}
      <Path d="M13.3 9.8Q16 6.3 18.7 9.8" fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M11.4 8.6Q16 3.1 20.6 8.6" fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" opacity={0.75} />
      <Path d="M9.5 7.4Q16 -0.1 22.5 7.4" fill="none" stroke="#fff" strokeWidth={1.3} strokeLinecap="round" opacity={0.5} />

      {/* Transducer head */}
      <Path
        d="M11.3 14.2Q11.3 9.6 16 9.6Q20.7 9.6 20.7 14.2L20.7 15Q20.7 16 19.7 16L12.3 16Q11.3 16 11.3 15Z"
        fill="#fff"
      />
      {/* Tapered probe body */}
      <Path d="M13.4 16L18.6 16L17.7 22.4L14.3 22.4Z" fill="#fff" />
      {/* Grip ridges */}
      <Path d="M14 18.3L18 18.3" stroke="#004a5e" strokeWidth={0.8} strokeLinecap="round" opacity={0.55} />
      <Path d="M14.25 20.4L17.75 20.4" stroke="#004a5e" strokeWidth={0.8} strokeLinecap="round" opacity={0.55} />
      <Circle cx={16} cy={23.1} r={0.9} fill="#fff" />

      {/* Coiled cable, draping from the probe tip */}
      <Path
        d="M16 23.6C15.7 25.4 11.4 24.4 9.4 27.6"
        fill="none"
        stroke="#fff"
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.85}
      />
      <Path
        d="M16 23.6C16.3 25.4 20.6 24.4 22.6 27.6"
        fill="none"
        stroke="#fff"
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.85}
      />
    </Svg>
  );
}
