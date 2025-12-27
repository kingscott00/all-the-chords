import { ChordVoicing, CHORD_TYPE_INFO } from "../../types";
import { ChordDiagram } from "../ChordDiagram";

interface ChordCardProps {
  voicing: ChordVoicing;
  showFingers?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ChordCard({
  voicing,
  showFingers = false,
  onClick,
  className = "",
}: ChordCardProps) {
  const chordInfo = CHORD_TYPE_INFO[voicing.chordType];
  const chordName = `${voicing.root}${chordInfo.shortName}`;

  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-gray-300 transition-all duration-200
        flex flex-col items-center p-3
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Chord Diagram */}
      <ChordDiagram
        voicing={voicing}
        size="medium"
        showFingers={showFingers}
        highlightRoot={true}
        interactive={false}
      />

      {/* Chord Name */}
      <div className="mt-2 text-center">
        <div className="font-semibold text-gray-900">{chordName}</div>
        {voicing.cagedShape && (
          <div className="text-xs text-gray-500">
            {voicing.cagedShape} Shape
          </div>
        )}
        {voicing.isInversion && voicing.inversionNumber && (
          <div className="text-xs text-gray-400">
            {voicing.inversionNumber === 1
              ? "1st"
              : voicing.inversionNumber === 2
                ? "2nd"
                : "3rd"}{" "}
            Inversion
          </div>
        )}
      </div>
    </div>
  );
}

export default ChordCard;
