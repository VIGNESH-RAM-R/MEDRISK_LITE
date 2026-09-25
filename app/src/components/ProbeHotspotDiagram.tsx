import { Text as RNText, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Ellipse, Polyline, Rect, Text as SvgText } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { componentColor, componentName } from "../lib/constants";

const VIEW_W = 380;
const VIEW_H = 170;

const HOTSPOTS: { cx: number; cy: number; id: string }[] = [
  { cx: 26, cy: 150, id: "CN" },
  { cx: 150, cy: 97, id: "PW" },
  { cx: 195, cy: 97, id: "EL" },
  { cx: 235, cy: 97, id: "HS" },
  { cx: 70, cy: 133, id: "CB" },
  { cx: 300, cy: 80, id: "SH" },
  { cx: 332, cy: 90, id: "TA" },
  { cx: 332, cy: 110, id: "AL" },
  { cx: 15, cy: 45, id: "UI" },
];

// Faithful port of the reference app's probeSvg() — a stylised ultrasound
// probe with a tappable hotspot per component. The SVG itself is purely
// decorative (no touch handlers on its shapes — react-native-svg's web
// shim mishandles those); a grid of plain, transparent TouchableOpacity
// overlays positioned by percentage over the viewBox provides the taps.
export function ProbeHotspotDiagram({
  sheathApplied,
  selected,
  onSelect,
}: {
  sheathApplied: boolean;
  selected: string | null;
  onSelect: (componentId: string) => void;
}) {
  const { t } = useTranslation();
  const dot = (cx: number, cy: number, id: string) => (
    <Circle
      key={id}
      cx={cx}
      cy={cy}
      r={selected === id ? 11 : 9}
      fill={componentColor(id)}
      stroke="#0a0e16"
      strokeWidth={2}
    />
  );

  return (
    <View>
      <View style={{ aspectRatio: VIEW_W / VIEW_H, width: "100%" }}>
        <Svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" height="100%">
          <Polyline
            points="8,150 55,150 85,120 115,95"
            fill="none"
            stroke="#4b5570"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Rect x={0} y={140} width={26} height={20} rx={4} fill="#334155" />
          <Rect x={115} y={70} width={150} height={55} rx={18} fill="#1b2338" stroke="#2a3350" />
          <Rect x={265} y={82} width={55} height={30} rx={12} fill="#212a42" stroke="#2a3350" />
          <Ellipse cx={332} cy={97} rx={10} ry={16} fill="#1b2338" stroke="#2a3350" />
          {sheathApplied && (
            <Rect
              x={255}
              y={75}
              width={90}
              height={45}
              rx={16}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          )}
          {HOTSPOTS.map((h) => dot(h.cx, h.cy, h.id))}
          <SvgText x={10} y={30} fontSize={10} fill="#8b93a7">
            {t("workspace.probeUiHint")}
          </SvgText>
        </Svg>

        {HOTSPOTS.map((h) => (
          <TouchableOpacity
            key={h.id}
            onPress={() => onSelect(h.id)}
            accessibilityLabel={componentName(h.id, t)}
            style={{
              position: "absolute",
              left: `${(h.cx / VIEW_W) * 100}%`,
              top: `${(h.cy / VIEW_H) * 100}%`,
              width: 24,
              height: 24,
              marginLeft: -12,
              marginTop: -12,
            }}
          />
        ))}
      </View>
      {selected ? (
        <RNText style={{ fontSize: 10.5, color: componentColor(selected), fontWeight: "700", marginTop: 4 }}>
          {componentName(selected, t)}
        </RNText>
      ) : (
        <RNText style={{ fontSize: 10.5, color: "#8b93a7", marginTop: 4 }}>
          {t("workspace.probeTapHint")}
        </RNText>
      )}
    </View>
  );
}
