import { ChordVoicing } from "../../types";
import { toRomanNumeral } from "../../utils/romanNumerals";

interface ChordDiagramProps {
  voicing: ChordVoicing;
  size?: "small" | "medium" | "large";
  width?: number;
  showFingers?: boolean;
  highlightRoot?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

// Size presets
const SIZE_MAP = {
  small: 80,
  medium: 120,
  large: 160,
};

// SVG dimensions based on spec
const VIEWBOX_WIDTH = 100;
const VIEWBOX_HEIGHT = 130;

// Grid positions
const GRID_LEFT = 20;
const GRID_RIGHT = 80;
const GRID_TOP = 25;
const GRID_BOTTOM = 105;
const STRING_SPACING = 12; // (80-20) / 5 = 12
const FRET_SPACING = 20; // (105-25) / 4 = 20
const NUM_FRETS_SHOWN = 4;

// Dot styling
const DOT_RADIUS = 7;
const ROOT_DOT_INNER_RADIUS = 3;
const MARKER_Y = 12;

export function ChordDiagram({
  voicing,
  size = "medium",
  width,
  showFingers = false,
  highlightRoot = true,
  interactive = true,
  onClick,
  className = "",
}: ChordDiagramProps) {
  const svgWidth = width || SIZE_MAP[size];
  const showNut = voicing.startingFret === 1;

  // Calculate string X positions (0 = low E on left, 5 = high E on right)
  const getStringX = (stringIndex: number) => GRID_LEFT + stringIndex * STRING_SPACING;

  // Calculate fret Y positions (relative to starting fret)
  const getFretY = (fretOffset: number) => GRID_TOP + fretOffset * FRET_SPACING;

  // Get dot Y position (centered in fret space)
  const getDotY = (fretOffset: number) => getFretY(fretOffset - 1) + FRET_SPACING / 2;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      width={svgWidth}
      height={svgWidth * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH)}
      className={`${className} ${interactive ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : "img"}
      aria-label={`${voicing.root} ${voicing.chordType} chord diagram`}
    >
      {/* Background */}
      <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="white" />

      {/* Nut or fret position indicator */}
      {showNut ? (
        // Draw thick nut
        <rect
          x={GRID_LEFT - 2}
          y={GRID_TOP - 3}
          width={GRID_RIGHT - GRID_LEFT + 4}
          height={4}
          fill="black"
          rx={1}
        />
      ) : (
        // Show Roman numeral for fret position
        <text
          x={8}
          y={GRID_TOP + FRET_SPACING / 2}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="black"
        >
          {toRomanNumeral(voicing.startingFret)}
        </text>
      )}

      {/* Horizontal fret lines */}
      {Array.from({ length: NUM_FRETS_SHOWN + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={GRID_LEFT}
          y1={getFretY(i)}
          x2={GRID_RIGHT}
          y2={getFretY(i)}
          stroke="black"
          strokeWidth={i === 0 && !showNut ? 1 : 1}
        />
      ))}

      {/* Vertical string lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={getStringX(i)}
          y1={GRID_TOP}
          x2={getStringX(i)}
          y2={GRID_BOTTOM}
          stroke="black"
          strokeWidth={1}
        />
      ))}

      {/* String markers (X for muted, O for open) */}
      {voicing.strings.map((fret, stringIndex) => {
        const x = getStringX(stringIndex);

        if (fret === null) {
          // Muted string - draw X
          return (
            <g key={`marker-${stringIndex}`}>
              <line
                x1={x - 4}
                y1={MARKER_Y - 4}
                x2={x + 4}
                y2={MARKER_Y + 4}
                stroke="black"
                strokeWidth={1.5}
              />
              <line
                x1={x + 4}
                y1={MARKER_Y - 4}
                x2={x - 4}
                y2={MARKER_Y + 4}
                stroke="black"
                strokeWidth={1.5}
              />
            </g>
          );
        }

        if (fret === 0) {
          // Open string - draw O
          return (
            <circle
              key={`marker-${stringIndex}`}
              cx={x}
              cy={MARKER_Y}
              r={4}
              fill="none"
              stroke="black"
              strokeWidth={1.5}
            />
          );
        }

        return null;
      })}

      {/* Barre indicators */}
      {voicing.barres?.map((barre, i) => {
        const fretOffset = barre.fret - voicing.startingFret + 1;
        if (fretOffset < 1 || fretOffset > NUM_FRETS_SHOWN) return null;

        const y = getDotY(fretOffset);
        const x1 = getStringX(barre.fromString);
        const x2 = getStringX(barre.toString);

        return (
          <rect
            key={`barre-${i}`}
            x={Math.min(x1, x2)}
            y={y - 4}
            width={Math.abs(x2 - x1)}
            height={8}
            fill="black"
            rx={4}
          />
        );
      })}

      {/* Finger position dots */}
      {voicing.strings.map((fret, stringIndex) => {
        if (fret === null || fret === 0) return null;

        const fretOffset = fret - voicing.startingFret + 1;
        if (fretOffset < 1 || fretOffset > NUM_FRETS_SHOWN) return null;

        const x = getStringX(stringIndex);
        const y = getDotY(fretOffset);
        const isRoot = highlightRoot && voicing.rootStringIndices.includes(stringIndex);
        const fingerNumber = showFingers && voicing.fingers ? voicing.fingers[stringIndex] : null;

        return (
          <g key={`dot-${stringIndex}`}>
            {/* Main dot */}
            <circle cx={x} cy={y} r={DOT_RADIUS} fill="black" />

            {/* Root note indicator - white inner circle */}
            {isRoot && (
              <circle cx={x} cy={y} r={ROOT_DOT_INNER_RADIUS} fill="white" />
            )}

            {/* Finger number */}
            {fingerNumber && fingerNumber > 0 && !isRoot && (
              <text
                x={x}
                y={y}
                fontSize={8}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {fingerNumber}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default ChordDiagram;
