import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ChordVoicing,
  ChordType,
  ROOT_NOTES,
  CHORD_TYPE_INFO,
} from "../types";
import { Header } from "../components/Navigation";
import { ChordDiagram } from "../components/ChordDiagram";
import { FullFretboard } from "../components/Fretboard";
import { getVoicingsByType } from "../data/chordDatabase";
import { useAudio } from "../hooks";
import { parseRootNote } from "../utils/noteUtils";

const MAX_COMPARE = 4;

export function Compare() {
  const { playChord, isPlaying } = useAudio();
  const [selectedVoicings, setSelectedVoicings] = useState<ChordVoicing[]>([]);
  const [searchRoot, setSearchRoot] = useState<string>("C");
  const [searchType, setSearchType] = useState<ChordType>(ChordType.MAJOR);
  const [preferFlat, setPreferFlat] = useState(false);

  // Get voicings for search
  const searchVoicings = useMemo(() => {
    return getVoicingsByType(searchRoot, searchType, preferFlat);
  }, [searchRoot, searchType, preferFlat]);

  const handleAddVoicing = (voicing: ChordVoicing) => {
    if (selectedVoicings.length >= MAX_COMPARE) return;
    if (selectedVoicings.some((v) => v.id === voicing.id)) return;
    setSelectedVoicings([...selectedVoicings, voicing]);
  };

  const handleRemoveVoicing = (id: string) => {
    setSelectedVoicings(selectedVoicings.filter((v) => v.id !== id));
  };

  const handleClearAll = () => {
    setSelectedVoicings([]);
  };

  const handlePlayChord = useCallback(
    async (voicing: ChordVoicing) => {
      if (isPlaying) return;
      await playChord(voicing);
    },
    [playChord, isPlaying]
  );

  const chordTypes = Object.values(ChordType);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-2">
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
                className="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Compare Chords
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Compare up to {MAX_COMPARE} chord voicings side by side on the fretboard.
          </p>
        </section>

        {/* Selected Chords for Comparison */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Chords ({selectedVoicings.length}/{MAX_COMPARE})
            </h2>
            {selectedVoicings.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Clear All
              </button>
            )}
          </div>

          {selectedVoicings.length > 0 ? (
            <>
              {/* Chord cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {selectedVoicings.map((voicing, index) => {
                  const chordInfo = CHORD_TYPE_INFO[voicing.chordType];
                  const chordName = `${voicing.root}${chordInfo.shortName}`;
                  const colors = ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-amber-500"];

                  return (
                    <div
                      key={voicing.id}
                      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3"
                    >
                      {/* Color indicator */}
                      <div
                        className={`absolute top-2 left-2 w-3 h-3 rounded-full ${colors[index]}`}
                      />
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveVoicing(voicing.id)}
                        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      <div className="flex flex-col items-center pt-4">
                        <ChordDiagram
                          voicing={voicing}
                          size="small"
                          showFingers={true}
                          highlightRoot={true}
                          interactive={true}
                          onClick={() => handlePlayChord(voicing)}
                        />
                        <div className="mt-2 text-center">
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {chordName}
                          </div>
                          {voicing.cagedShape && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {voicing.cagedShape} Shape
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Fretboard comparison */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Fretboard Comparison
                </h3>
                <FullFretboard voicings={selectedVoicings} showNoteNames={true} />
              </div>
            </>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">
                Select chords below to compare them on the fretboard.
              </p>
            </div>
          )}
        </section>

        {/* Chord Selector */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Chords to Compare
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Root selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Root Note
              </label>
              <select
                value={searchRoot}
                onChange={(e) => setSearchRoot(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {ROOT_NOTES.map((root) => (
                  <option key={root} value={root}>
                    {parseRootNote(root, preferFlat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Chord type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Chord Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as ChordType)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {chordTypes.map((type) => (
                  <option key={type} value={type}>
                    {CHORD_TYPE_INFO[type].name}
                  </option>
                ))}
              </select>
            </div>

            {/* Flat/Sharp toggle */}
            <div className="flex items-end">
              <button
                onClick={() => setPreferFlat(!preferFlat)}
                className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border border-blue-300 dark:border-blue-600 rounded-lg"
              >
                {preferFlat ? "Show Sharps" : "Show Flats"}
              </button>
            </div>
          </div>

          {/* Available voicings */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {searchVoicings.map((voicing) => {
              const isSelected = selectedVoicings.some((v) => v.id === voicing.id);
              const isDisabled = selectedVoicings.length >= MAX_COMPARE && !isSelected;

              return (
                <button
                  key={voicing.id}
                  onClick={() => {
                    if (isSelected) {
                      handleRemoveVoicing(voicing.id);
                    } else if (!isDisabled) {
                      handleAddVoicing(voicing);
                    }
                  }}
                  disabled={isDisabled}
                  className={`
                    relative p-2 rounded-lg border transition-all
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500"
                        : isDisabled
                          ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600"
                    }
                  `}
                >
                  <ChordDiagram
                    voicing={voicing}
                    size="small"
                    showFingers={false}
                    highlightRoot={true}
                    interactive={false}
                  />
                  {voicing.cagedShape && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      {voicing.cagedShape}
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {searchVoicings.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No voicings found for this chord type.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Compare;
