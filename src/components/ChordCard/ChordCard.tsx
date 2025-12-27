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
  onShowFretboard?: (voicing: ChordVoicing) => void;
  isKeyboardFocused?: boolean;
  index?: number;
  className?: string;
}

export function ChordCard({
  voicing,
  showFingers = false,
  onPlay,
  isPlaying = false,
  isFavorite = false,
  onToggleFavorite,
  onShowFretboard,
  isKeyboardFocused = false,
  index,
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
        relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
        hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500
        hover:-translate-y-1 hover:scale-[1.02]
        active:scale-[0.98] active:shadow-sm
        transition-all duration-200 ease-out
        flex flex-col items-center p-3
        ${onPlay ? "cursor-pointer" : ""}
        ${isPlaying ? "ring-2 ring-blue-400 border-blue-400 dark:ring-blue-500 dark:border-blue-500 scale-[0.98]" : ""}
        ${isKeyboardFocused ? "ring-2 ring-green-500 border-green-500 dark:ring-green-400 dark:border-green-400" : ""}
        ${className}
      `}
      onClick={handleClick}
      data-chord-index={index}
      tabIndex={isKeyboardFocused ? 0 : -1}
    >
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        {onShowFretboard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowFretboard(voicing);
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            title="Show on fretboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>
        )}
        {onToggleFavorite && (
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => onToggleFavorite(voicing.id)}
          />
        )}
      </div>

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
        <div className="font-semibold text-gray-900 dark:text-white">{chordName}</div>
        {voicing.cagedShape && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {voicing.cagedShape} Shape
          </div>
        )}
        {voicing.isInversion && voicing.inversionNumber && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
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
