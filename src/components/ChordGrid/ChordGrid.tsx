import { ChordVoicing, ChordType, CHORD_TYPE_INFO } from "../../types";
import { ChordCard } from "../ChordCard";
import { groupVoicingsByType } from "../../data/chordDatabase";
import { useKeyboardNav } from "../../hooks";

interface ChordGridProps {
  voicings: ChordVoicing[];
  showFingers?: boolean;
  groupByType?: boolean;
  onChordPlay?: (voicing: ChordVoicing) => void;
  playingChordId?: string | null;
  isFavorite?: (id: string) => boolean;
  onToggleFavorite?: (id: string) => void;
  onShowFretboard?: (voicing: ChordVoicing) => void;
  enableKeyboardNav?: boolean;
}

export function ChordGrid({
  voicings,
  showFingers = false,
  groupByType = true,
  onChordPlay,
  playingChordId,
  isFavorite,
  onToggleFavorite,
  onShowFretboard,
  enableKeyboardNav = true,
}: ChordGridProps) {
  const { focusedIndex, containerRef } = useKeyboardNav({
    voicings,
    onSelect: onChordPlay,
    enabled: enableKeyboardNav,
  });

  // Build a map from voicing ID to absolute index for keyboard nav
  const voicingIndexMap = new Map<string, number>();
  voicings.forEach((v, i) => voicingIndexMap.set(v.id, i));

  if (groupByType) {
    const grouped = groupVoicingsByType(voicings);
    const sortedTypes = Array.from(grouped.keys()).sort((a, b) => {
      return getChordTypeOrder(a) - getChordTypeOrder(b);
    });

    return (
      <div ref={containerRef} className="space-y-8">
        {sortedTypes.map((type) => {
          const typeVoicings = grouped.get(type) || [];
          const typeInfo = CHORD_TYPE_INFO[type];

          return (
            <section key={type}>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                {typeInfo.name} Chords
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {typeVoicings.map((voicing) => {
                  const absoluteIndex = voicingIndexMap.get(voicing.id) ?? -1;
                  return (
                    <ChordCard
                      key={voicing.id}
                      voicing={voicing}
                      showFingers={showFingers}
                      onPlay={onChordPlay}
                      isPlaying={playingChordId === voicing.id}
                      isFavorite={isFavorite?.(voicing.id)}
                      onToggleFavorite={onToggleFavorite}
                      onShowFretboard={onShowFretboard}
                      isKeyboardFocused={absoluteIndex === focusedIndex}
                      index={absoluteIndex}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {voicings.map((voicing, index) => (
        <ChordCard
          key={voicing.id}
          voicing={voicing}
          showFingers={showFingers}
          onPlay={onChordPlay}
          isPlaying={playingChordId === voicing.id}
          isFavorite={isFavorite?.(voicing.id)}
          onToggleFavorite={onToggleFavorite}
          onShowFretboard={onShowFretboard}
          isKeyboardFocused={index === focusedIndex}
          index={index}
        />
      ))}
    </div>
  );
}

function getChordTypeOrder(type: ChordType): number {
  const order: Record<ChordType, number> = {
    [ChordType.MAJOR]: 1,
    [ChordType.MINOR]: 2,
    [ChordType.AUGMENTED]: 3,
    [ChordType.DIMINISHED]: 4,
    [ChordType.SUS2]: 5,
    [ChordType.SUS4]: 6,
    [ChordType.MAJOR_7]: 10,
    [ChordType.DOMINANT_7]: 11,
    [ChordType.MINOR_7]: 12,
    [ChordType.HALF_DIMINISHED]: 13,
    [ChordType.DIMINISHED_7]: 14,
    [ChordType.AUGMENTED_7]: 15,
    [ChordType.MAJOR_9]: 20,
    [ChordType.DOMINANT_9]: 21,
    [ChordType.MINOR_9]: 22,
    [ChordType.MAJOR_11]: 30,
    [ChordType.DOMINANT_11]: 31,
    [ChordType.MINOR_11]: 32,
    [ChordType.MAJOR_13]: 40,
    [ChordType.DOMINANT_13]: 41,
    [ChordType.MINOR_13]: 42,
  };
  return order[type] ?? 100;
}

export default ChordGrid;
