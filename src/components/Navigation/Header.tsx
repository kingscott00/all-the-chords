import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../Search";
import { useSearch, SearchResult } from "../../hooks/useSearch";
import { parseRootNote } from "../../utils/noteUtils";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { query, results, search, clearSearch } = useSearch();

  const handleSelectResult = (result: SearchResult) => {
    const rootPath = parseRootNote(result.voicing.root)
      .toLowerCase()
      .replace("#", "sharp")
      .replace("b", "flat");
    navigate(`/chords/${rootPath}`);
    clearSearch();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4 w-full max-w-7xl mx-auto">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle menu"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo / Title */}
        <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 whitespace-nowrap">
          All The Chords
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search bar - hidden on small screens */}
        <div className="hidden sm:block">
          <SearchBar
            query={query}
            results={results}
            onSearch={search}
            onClear={clearSearch}
            onSelectResult={handleSelectResult}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
