import { ChordVoicing, CHORD_TYPE_INFO } from "../../types";
import { Modal } from "../common";
import { FullFretboard } from "./FullFretboard";
import { ChordDiagram } from "../ChordDiagram";

interface FretboardModalProps {
  voicing: ChordVoicing | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay?: (voicing: ChordVoicing) => void;
}

export function FretboardModal({
  voicing,
  isOpen,
  onClose,
  onPlay,
}: FretboardModalProps) {
  if (!voicing) return null;

  const chordInfo = CHORD_TYPE_INFO[voicing.chordType];
  const chordName = `${voicing.root}${chordInfo.shortName}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${chordName} - Fretboard View`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Chord info and diagram */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            <ChordDiagram
              voicing={voicing}
              size="large"
              showFingers={true}
              highlightRoot={true}
              interactive={!!onPlay}
              onClick={() => onPlay?.(voicing)}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {chordName}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {chordInfo.name}
            </p>
            <div className="space-y-2 text-sm">
              {voicing.cagedShape && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Shape:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {voicing.cagedShape} Form
                  </span>
                </div>
              )}
              {voicing.subcategory && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {voicing.subcategory}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Starting Fret:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {voicing.startingFret}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Intervals:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {chordInfo.intervals.join(" - ")}
                </span>
              </div>
              {voicing.isInversion && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">Inversion:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {voicing.inversionNumber === 1
                      ? "1st"
                      : voicing.inversionNumber === 2
                        ? "2nd"
                        : "3rd"}
                  </span>
                </div>
              )}
            </div>
            {onPlay && (
              <button
                onClick={() => onPlay(voicing)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Chord
              </button>
            )}
          </div>
        </div>

        {/* Full fretboard visualization */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fretboard Position
          </h4>
          <FullFretboard voicings={[voicing]} showNoteNames={true} />
        </div>
      </div>
    </Modal>
  );
}

export default FretboardModal;
