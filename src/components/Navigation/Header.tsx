interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
        <h1 className="text-xl font-bold text-gray-900">
          All The Chords
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Future: Search bar, settings, etc. */}
      </div>
    </header>
  );
}

export default Header;
