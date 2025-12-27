import { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChordVoicing } from "../types";
import { Header } from "../components/Navigation";
import { ChordGrid } from "../components/ChordGrid";
import { FretboardModal } from "../components/Fretboard";
import { useAudio, useFavorites } from "../hooks";

export function Favorites() {
  const { playChord, isPlaying, settings, setMuted } = useAudio();
  const [playingChordId, setPlayingChordId] = useState<string | null>(null);
  const [showFingers, setShowFingers] = useState(false);
  const [fretboardVoicing, setFretboardVoicing] = useState<ChordVoicing | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    getFavoriteVoicings,
    isFavorite,
    toggleFavorite,
    clearAll,
    favoriteCount,
    exportFavorites,
    importFavorites,
  } = useFavorites();

  const favorites = getFavoriteVoicings();

  const handleChordPlay = useCallback(
    async (voicing: ChordVoicing) => {
      if (isPlaying) return;
      setPlayingChordId(voicing.id);
      await playChord(voicing);
      setTimeout(() => setPlayingChordId(null), 500);
    },
    [playChord, isPlaying]
  );

  const handleExport = () => {
    const data = exportFavorites();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all-the-chords-favorites.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFavorites(content);
      if (success) {
        setImportStatus("Favorites imported successfully!");
      } else {
        setImportStatus("Failed to import - invalid file format.");
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);

    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link
                to="/chords/a"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Favorites
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Hidden file input for import */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              {favoriteCount > 0 && (
                <>
                  <button
                    onClick={handleExport}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to clear all favorites?"
                        )
                      ) {
                        clearAll();
                      }
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {favoriteCount} saved chord{favoriteCount !== 1 ? "s" : ""}
            </p>
            {importStatus && (
              <p className={`text-sm ${importStatus.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {importStatus}
              </p>
            )}
          </div>
        </section>

        {/* Options */}
        {favoriteCount > 0 && (
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
        )}

        {/* Favorites Grid */}
        <section>
          {favorites.length > 0 ? (
            <ChordGrid
              voicings={favorites}
              showFingers={showFingers}
              groupByType={true}
              onChordPlay={handleChordPlay}
              playingChordId={playingChordId}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onShowFretboard={setFretboardVoicing}
            />
          ) : (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Click the heart icon on any chord to save it here.
              </p>
              <Link
                to="/chords/a"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Chords
              </Link>
            </div>
          )}
        </section>
      </main>

      {/* Fretboard Modal */}
      <FretboardModal
        voicing={fretboardVoicing}
        isOpen={fretboardVoicing !== null}
        onClose={() => setFretboardVoicing(null)}
        onPlay={handleChordPlay}
      />
    </div>
  );
}

export default Favorites;
