import { useMemo } from "react";
import { ChordVoicing } from "../../types";
import { useTheme } from "../../hooks";

interface FullFretboardProps {
  voicings: ChordVoicing[];
  showNoteNames?: boolean;
  showIntervals?: boolean;
  numFrets?: number;
  className?: string;
}

// Standard tuning: E2, A2, D3, G3, B3, E4
const OPEN_STRING_NOTES = ["E", "A", "D", "G", "B", "E"];
const ALL_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Colors for multiple voicings overlay
const VOICING_COLORS = [
  { fill: "#3b82f6", text: "#ffffff" }, // blue
  { fill: "#ef4444", text: "#ffffff" }, // red
  { fill: "#22c55e", text: "#ffffff" }, // green
  { fill: "#f59e0b", text: "#000000" }, // amber
];

function getNoteAtFret(stringIndex: number, fret: number): string {
  const openNote = OPEN_STRING_NOTES[stringIndex];
  const openNoteIndex = ALL_NOTES.indexOf(openNote);
  const noteIndex = (openNoteIndex + fret) % 12;
  return ALL_NOTES[noteIndex];
}

export function FullFretboard({
  voicings,
  showNoteNames = true,
  showIntervals: _showIntervals = false,
  numFrets = 15,
  className = "",
}: FullFretboardProps) {
  const { isDark } = useTheme();

  // Theme colors
  const bgColor = isDark ? "#1f2937" : "#fef3c7"; // warm wood tone for light, gray-800 for dark
  const fretColor = isDark ? "#9ca3af" : "#78716c"; // gray tones
  const stringColor = isDark ? "#d1d5db" : "#44403c";
  const nutColor = isDark ? "#f3f4f6" : "#1c1917";
  const dotColor = isDark ? "#4b5563" : "#d6d3d1";
  const textColor = isDark ? "#f3f4f6" : "#1c1917";

  // Calculate dimensions
  const stringSpacing = 20;
  const fretSpacing = 50;
  const marginLeft = 40;
  const marginTop = 30;
  const marginBottom = 30;
  const width = marginLeft + (numFrets + 1) * fretSpacing;
  const height = marginTop + 5 * stringSpacing + marginBottom;

  // Get positions for all notes in all voicings
  const notePositions = useMemo(() => {
    const positions: Array<{
      stringIndex: number;
      fret: number;
      note: string;
      isRoot: boolean;
      voicingIndex: number;
    }> = [];

    voicings.forEach((voicing, voicingIndex) => {
      voicing.strings.forEach((fret, stringIndex) => {
        if (fret !== null) {
          const actualFret = fret;
          const note = getNoteAtFret(stringIndex, actualFret);
          const isRoot = voicing.rootStringIndices.includes(stringIndex);
          positions.push({
            stringIndex,
            fret: actualFret,
            note,
            isRoot,
            voicingIndex,
          });
        }
      });
    });

    return positions;
  }, [voicings]);

  // Fret marker positions (standard dots at frets 3, 5, 7, 9, 12, 15)
  const fretMarkers = [3, 5, 7, 9, 12, 15].filter((f) => f <= numFrets);
  const doubleDotFrets = [12].filter((f) => f <= numFrets);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-full"
        style={{ minWidth: width }}
      >
        {/* Background */}
        <rect width={width} height={height} fill={bgColor} rx={4} />

        {/* Nut */}
        <rect
          x={marginLeft - 4}
          y={marginTop - 2}
          width={8}
          height={5 * stringSpacing + 4}
          fill={nutColor}
          rx={2}
        />

        {/* Frets */}
        {Array.from({ length: numFrets + 1 }).map((_, fretNum) => (
          <line
            key={`fret-${fretNum}`}
            x1={marginLeft + fretNum * fretSpacing}
            y1={marginTop}
            x2={marginLeft + fretNum * fretSpacing}
            y2={marginTop + 5 * stringSpacing}
            stroke={fretColor}
            strokeWidth={fretNum === 0 ? 0 : 2}
          />
        ))}

        {/* Fret markers (dots) */}
        {fretMarkers.map((fretNum) => {
          const x = marginLeft + (fretNum - 0.5) * fretSpacing;
          const isDouble = doubleDotFrets.includes(fretNum);

          if (isDouble) {
            return (
              <g key={`marker-${fretNum}`}>
                <circle
                  cx={x}
                  cy={marginTop + 1.5 * stringSpacing}
                  r={6}
                  fill={dotColor}
                />
                <circle
                  cx={x}
                  cy={marginTop + 3.5 * stringSpacing}
                  r={6}
                  fill={dotColor}
                />
              </g>
            );
          }

          return (
            <circle
              key={`marker-${fretNum}`}
              cx={x}
              cy={marginTop + 2.5 * stringSpacing}
              r={6}
              fill={dotColor}
            />
          );
        })}

        {/* Strings */}
        {Array.from({ length: 6 }).map((_, stringIndex) => (
          <line
            key={`string-${stringIndex}`}
            x1={marginLeft}
            y1={marginTop + stringIndex * stringSpacing}
            x2={width - 20}
            y2={marginTop + stringIndex * stringSpacing}
            stroke={stringColor}
            strokeWidth={1 + (5 - stringIndex) * 0.3} // Thicker for lower strings
          />
        ))}

        {/* String labels (open notes) */}
        {OPEN_STRING_NOTES.map((note, stringIndex) => (
          <text
            key={`label-${stringIndex}`}
            x={15}
            y={marginTop + stringIndex * stringSpacing}
            fontSize={12}
            fill={textColor}
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="bold"
          >
            {note}
          </text>
        ))}

        {/* Fret numbers */}
        {Array.from({ length: numFrets }).map((_, i) => {
          const fretNum = i + 1;
          return (
            <text
              key={`fretnum-${fretNum}`}
              x={marginLeft + (fretNum - 0.5) * fretSpacing}
              y={height - 10}
              fontSize={10}
              fill={textColor}
              textAnchor="middle"
              opacity={0.6}
            >
              {fretNum}
            </text>
          );
        })}

        {/* Note positions */}
        {notePositions.map((pos, i) => {
          const color = VOICING_COLORS[pos.voicingIndex % VOICING_COLORS.length];
          const x =
            pos.fret === 0
              ? marginLeft - 15
              : marginLeft + (pos.fret - 0.5) * fretSpacing;
          const y = marginTop + pos.stringIndex * stringSpacing;
          const radius = pos.isRoot ? 10 : 8;

          return (
            <g key={`note-${i}`}>
              {/* Outer circle for root */}
              {pos.isRoot && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 3}
                  fill="none"
                  stroke={color.fill}
                  strokeWidth={2}
                />
              )}
              {/* Main dot */}
              <circle cx={x} cy={y} r={radius} fill={color.fill} />
              {/* Note name or interval */}
              {showNoteNames && (
                <text
                  x={x}
                  y={y}
                  fontSize={pos.isRoot ? 9 : 8}
                  fill={color.text}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontWeight={pos.isRoot ? "bold" : "normal"}
                >
                  {pos.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend for multiple voicings */}
      {voicings.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {voicings.map((voicing, i) => {
            const color = VOICING_COLORS[i % VOICING_COLORS.length];
            return (
              <div key={voicing.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color.fill }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {voicing.root}
                  {voicing.chordType}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FullFretboard;
