import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChordCategory, ChordType, ChordVoicing, ROOT_NOTES } from "../types";
import { Header, RootSelector, CategoryNav } from "../components/Navigation";
import { ChordGrid } from "../components/ChordGrid";
import {
  getVoicingsForRoot,
  getVoicingsByCategory,
  getVoicingsByType,
  getAvailableChordTypes,
} from "../data/chordDatabase";
import { parseRootNote } from "../utils/noteUtils";
import { useAudio, useFavorites } from "../hooks";

export function ChordBrowser() {
  const { root } = useParams<{ root?: string }>();
  const navigate = useNavigate();

  // Audio hook
  const { playChord, isPlaying, settings, setMuted } = useAudio();
  const [playingChordId, setPlayingChordId] = useState<string | null>(null);

  // Favorites hook
  const { isFavorite, toggleFavorite, favoriteCount } = useFavorites();

  // Default to "A" if no root specified
  const selectedRoot = root
    ? ROOT_NOTES.find(
        (r) =>
          parseRootNote(r).toLowerCase() === root.toLowerCase() ||
          parseRootNote(r, true).toLowerCase() === root.toLowerCase()
      ) || "A"
    : "A";

  const [selectedCategory, setSelectedCategory] =
    useState<ChordCategory | null>(null);
  const [selectedChordType, setSelectedChordType] = useState<ChordType | null>(
    null
  );
  const [showFingers, setShowFingers] = useState(false);
  const [preferFlat, setPreferFlat] = useState(false);

  // Get available chord types for the selected root
  const availableTypes = useMemo(
    () => getAvailableChordTypes(selectedRoot),
    [selectedRoot]
  );

  // Get filtered voicings
  const voicings = useMemo(() => {
    if (selectedChordType) {
      return getVoicingsByType(selectedRoot, selectedChordType, preferFlat);
    }
    if (selectedCategory) {
      return getVoicingsByCategory(selectedRoot, selectedCategory, preferFlat);
    }
    return getVoicingsForRoot(selectedRoot, preferFlat);
  }, [selectedRoot, selectedCategory, selectedChordType, preferFlat]);

  const handleRootChange = (newRoot: string) => {
    const rootPath = parseRootNote(newRoot, preferFlat)
      .toLowerCase()
      .replace("#", "sharp")
      .replace("b", "flat");
    navigate(`/chords/${rootPath}`);
  };

  const handleChordPlay = useCallback(
    async (voicing: ChordVoicing) => {
      if (isPlaying) return;
      setPlayingChordId(voicing.id);
      await playChord(voicing);
      // Reset after a delay to show visual feedback
      setTimeout(() => setPlayingChordId(null), 500);
    },
    [playChord, isPlaying]
  );

  const displayRoot = parseRootNote(selectedRoot, preferFlat);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Root Note Selection */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Root Note</h2>
            <div className="flex items-center gap-4">
              {favoriteCount > 0 && (
                <Link
                  to="/favorites"
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {favoriteCount}
                </Link>
              )}
              <button
                onClick={() => setPreferFlat(!preferFlat)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {preferFlat ? "Show Sharps" : "Show Flats"}
              </button>
            </div>
          </div>
          <RootSelector
            selectedRoot={selectedRoot}
            onRootChange={handleRootChange}
            preferFlat={preferFlat}
          />
        </section>

        {/* Category / Type Navigation */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Chord Type
          </h2>
          <CategoryNav
            selectedCategory={selectedCategory}
            selectedChordType={selectedChordType}
            onCategoryChange={setSelectedCategory}
            onChordTypeChange={setSelectedChordType}
            availableTypes={availableTypes}
          />
        </section>

        {/* Options */}
        <section className="mb-6 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showFingers}
              onChange={(e) => setShowFingers(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            Show finger numbers
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(e) => setMuted(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            Mute audio
          </label>
        </section>

        {/* Chord Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayRoot} Chords
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {voicings.length} voicing{voicings.length !== 1 ? "s" : ""}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Click any chord to hear it. Click the heart to save to favorites.
          </p>

          {voicings.length > 0 ? (
            <ChordGrid
              voicings={voicings}
              showFingers={showFingers}
              groupByType={!selectedChordType}
              onChordPlay={handleChordPlay}
              playingChordId={playingChordId}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No voicings found for this selection.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ChordBrowser;
