import { ChordVoicing, CHORD_TYPE_INFO } from "../../types";
import { ChordDiagram } from "../ChordDiagram";
import { FavoriteButton } from "./FavoriteButton";

interface ChordCardProps {
  voicing: ChordVoicing;
  showFingers?: boolean;
  onPlay?: (voicing: ChordVoicing) => void;
  isPlaying?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

export function ChordCard({
  voicing,
  showFingers = false,
  onPlay,
  isPlaying = false,
  isFavorite = false,
  onToggleFavorite,
  className = "",
}: ChordCardProps) {
  const chordInfo = CHORD_TYPE_INFO[voicing.chordType];
  const chordName = `${voicing.root}${chordInfo.shortName}`;

  const handleClick = () => {
    onPlay?.(voicing);
  };

  return (
    <div
      className={`
        relative bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-gray-300 transition-all duration-200
        flex flex-col items-center p-3
        ${onPlay ? "cursor-pointer" : ""}
        ${isPlaying ? "ring-2 ring-blue-400 border-blue-400" : ""}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <div className="absolute top-2 right-2">
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => onToggleFavorite(voicing.id)}
          />
        </div>
      )}

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
