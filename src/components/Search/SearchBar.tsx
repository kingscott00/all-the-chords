import { useState, useRef, useEffect } from "react";
import { SearchResult } from "../../hooks/useSearch";
import { CHORD_TYPE_INFO } from "../../types";
import { ChordDiagram } from "../ChordDiagram";

interface SearchBarProps {
  query: string;
  results: SearchResult[];
  onSearch: (query: string) => void;
  onClear: () => void;
  onSelectResult?: (result: SearchResult) => void;
  placeholder?: string;
}

export function SearchBar({
  query,
  results,
  onSearch,
  onClear,
  onSelectResult,
  placeholder = "Search chords (e.g., Am7, C major, Dm)...",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          onSelectResult?.(results[selectedIndex]);
          setIsFocused(false);
          inputRef.current?.blur();
        } else if (results.length > 0) {
          onSelectResult?.(results[0]);
          setIsFocused(false);
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const showResults = isFocused && query.trim().length > 0;

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {/* Search Icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-auto"
        >
          {results.length > 0 ? (
            <ul className="py-1">
              {results.slice(0, 10).map((result, index) => {
                const info = CHORD_TYPE_INFO[result.voicing.chordType];
                const chordName = `${result.voicing.root}${info.shortName}`;

                return (
                  <li
                    key={result.voicing.id}
                    className={`
                      flex items-center gap-3 px-4 py-2 cursor-pointer
                      ${index === selectedIndex ? "bg-blue-50 dark:bg-blue-900" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
                    `}
                    onClick={() => onSelectResult?.(result)}
                  >
                    {/* Mini chord diagram */}
                    <div className="flex-shrink-0">
                      <ChordDiagram
                        voicing={result.voicing}
                        size="small"
                        interactive={false}
                      />
                    </div>
                    {/* Chord info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {chordName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {info.name}
                        {result.voicing.cagedShape && ` - ${result.voicing.cagedShape} Shape`}
                      </div>
                    </div>
                  </li>
                );
              })}
              {results.length > 10 && (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center border-t dark:border-gray-700">
                  +{results.length - 10} more results
                </li>
              )}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              No chords found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
