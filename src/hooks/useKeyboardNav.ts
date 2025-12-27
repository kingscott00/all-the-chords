import { useState, useCallback, useEffect, useRef } from "react";
import { ChordVoicing } from "../types";

interface UseKeyboardNavOptions {
  voicings: ChordVoicing[];
  columnsCount?: number;
  onSelect?: (voicing: ChordVoicing) => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  voicings,
  columnsCount = 6,
  onSelect,
  enabled = true,
}: UseKeyboardNavOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate responsive column count based on container width
  const getColumnsCount = useCallback(() => {
    if (!containerRef.current) return columnsCount;
    const width = containerRef.current.clientWidth;
    if (width < 640) return 2; // sm
    if (width < 768) return 3; // md
    if (width < 1024) return 4; // lg
    if (width < 1280) return 5; // xl
    return 6;
  }, [columnsCount]);

  // Navigate to adjacent item
  const navigate = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (voicings.length === 0) return;

      const cols = getColumnsCount();
      const currentIndex = focusedIndex < 0 ? 0 : focusedIndex;

      let newIndex: number;
      switch (direction) {
        case "left":
          newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
          break;
        case "right":
          newIndex =
            currentIndex < voicings.length - 1
              ? currentIndex + 1
              : currentIndex;
          break;
        case "up":
          newIndex =
            currentIndex >= cols ? currentIndex - cols : currentIndex;
          break;
        case "down":
          newIndex =
            currentIndex + cols < voicings.length
              ? currentIndex + cols
              : currentIndex;
          break;
        default:
          newIndex = currentIndex;
      }

      setFocusedIndex(newIndex);

      // Scroll focused element into view
      const element = containerRef.current?.querySelector(
        `[data-chord-index="${newIndex}"]`
      );
      if (element) {
        element.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    },
    [focusedIndex, voicings.length, getColumnsCount]
  );

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not focused on an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
        case "h":
          e.preventDefault();
          navigate("left");
          break;
        case "ArrowRight":
        case "l":
          e.preventDefault();
          navigate("right");
          break;
        case "ArrowUp":
        case "k":
          e.preventDefault();
          navigate("up");
          break;
        case "ArrowDown":
        case "j":
          e.preventDefault();
          navigate("down");
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (focusedIndex >= 0 && voicings[focusedIndex]) {
            onSelect?.(voicings[focusedIndex]);
          }
          break;
        case "Escape":
          setFocusedIndex(-1);
          break;
        case "Home":
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case "End":
          e.preventDefault();
          setFocusedIndex(voicings.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, navigate, focusedIndex, voicings, onSelect]);

  // Reset focus when voicings change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [voicings]);

  return {
    focusedIndex,
    setFocusedIndex,
    containerRef,
    isFocused: (index: number) => index === focusedIndex,
  };
}

export default useKeyboardNav;
