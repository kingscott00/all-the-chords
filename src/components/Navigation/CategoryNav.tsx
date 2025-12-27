import { ChordCategory, ChordType, CHORD_TYPE_INFO } from "../../types";

interface CategoryNavProps {
  selectedCategory: ChordCategory | null;
  selectedChordType: ChordType | null;
  onCategoryChange: (category: ChordCategory | null) => void;
  onChordTypeChange: (type: ChordType | null) => void;
  availableTypes?: ChordType[];
}

const CATEGORIES = [
  { value: null, label: "All" },
  { value: ChordCategory.TRIAD, label: "Triads" },
  { value: ChordCategory.SEVENTH, label: "Sevenths" },
  { value: ChordCategory.EXTENDED, label: "Extended" },
];

export function CategoryNav({
  selectedCategory,
  selectedChordType,
  onCategoryChange,
  onChordTypeChange,
  availableTypes = [],
}: CategoryNavProps) {
  // Filter available types by selected category
  const filteredTypes = selectedCategory
    ? availableTypes.filter(
        (type) => CHORD_TYPE_INFO[type].category === selectedCategory
      )
    : availableTypes;

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={label}
            onClick={() => {
              onCategoryChange(value);
              onChordTypeChange(null);
            }}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-colors duration-200
              ${
                selectedCategory === value
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chord type filter (when category is selected) */}
      {filteredTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChordTypeChange(null)}
            className={`
              px-3 py-1.5 rounded text-sm
              transition-colors duration-200
              ${
                selectedChordType === null
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            All Types
          </button>
          {filteredTypes.map((type) => {
            const info = CHORD_TYPE_INFO[type];
            return (
              <button
                key={type}
                onClick={() => onChordTypeChange(type)}
                className={`
                  px-3 py-1.5 rounded text-sm
                  transition-colors duration-200
                  ${
                    selectedChordType === type
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                {info.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryNav;
