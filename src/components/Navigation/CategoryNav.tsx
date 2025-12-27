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
                  ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
