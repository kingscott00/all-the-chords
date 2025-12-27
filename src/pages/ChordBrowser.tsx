import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChordCategory, ChordType, ROOT_NOTES } from "../types";
import { Header, RootSelector, CategoryNav } from "../components/Navigation";
import { ChordGrid } from "../components/ChordGrid";
import {
  getVoicingsForRoot,
  getVoicingsByCategory,
  getVoicingsByType,
  getAvailableChordTypes,
} from "../data/chordDatabase";
import { parseRootNote } from "../utils/noteUtils";

export function ChordBrowser() {
  const { root } = useParams<{ root?: string }>();
  const navigate = useNavigate();

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

  const displayRoot = parseRootNote(selectedRoot, preferFlat);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Root Note Selection */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Root Note</h2>
            <button
              onClick={() => setPreferFlat(!preferFlat)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {preferFlat ? "Show Sharps" : "Show Flats"}
            </button>
          </div>
          <RootSelector
            selectedRoot={selectedRoot}
            onRootChange={handleRootChange}
            preferFlat={preferFlat}
          />
        </section>

        {/* Category / Type Navigation */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
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
        <section className="mb-6 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={showFingers}
              onChange={(e) => setShowFingers(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show finger numbers
          </label>
        </section>

        {/* Chord Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {displayRoot} Chords
            </h2>
            <span className="text-sm text-gray-500">
              {voicings.length} voicing{voicings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {voicings.length > 0 ? (
            <ChordGrid
              voicings={voicings}
              showFingers={showFingers}
              groupByType={!selectedChordType}
              onChordClick={(voicing) => {
                console.log("Clicked chord:", voicing);
                // Future: open detail modal or play audio
              }}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              No voicings found for this selection.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ChordBrowser;
