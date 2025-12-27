import { ROOT_NOTES } from "../../types";
import { parseRootNote } from "../../utils/noteUtils";

interface RootSelectorProps {
  selectedRoot: string;
  onRootChange: (root: string) => void;
  preferFlat?: boolean;
  className?: string;
}

export function RootSelector({
  selectedRoot,
  onRootChange,
  preferFlat = false,
  className = "",
}: RootSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {ROOT_NOTES.map((root) => {
        const displayRoot = root.includes("/")
          ? preferFlat
            ? root.split("/")[1]
            : root.split("/")[0]
          : root;

        const isSelected =
          parseRootNote(selectedRoot, preferFlat) ===
          parseRootNote(root, preferFlat);

        return (
          <button
            key={root}
            onClick={() => onRootChange(root)}
            className={`
              px-3 py-2 rounded-lg font-medium text-sm
              transition-colors duration-200
              ${
                isSelected
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
            `}
            aria-pressed={isSelected}
          >
            {displayRoot}
          </button>
        );
      })}
    </div>
  );
}

export default RootSelector;
