import { useState, useEffect, useCallback } from "react";
import { ChordVoicing } from "../types";
import { getVoicingById } from "../data/chordDatabase";

const FAVORITES_STORAGE_KEY = "all-the-chords-favorites";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favoriteIds]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FAVORITES_STORAGE_KEY && e.newValue) {
        try {
          setFavoriteIds(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const addFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => prev.filter((fid) => fid !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((fid) => fid !== id);
      }
      return [...prev, id];
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds]
  );

  const getFavoriteVoicings = useCallback((): ChordVoicing[] => {
    return favoriteIds
      .map((id) => getVoicingById(id))
      .filter((v): v is ChordVoicing => v !== undefined);
  }, [favoriteIds]);

  const clearAll = useCallback(() => {
    setFavoriteIds([]);
  }, []);

  const exportFavorites = useCallback((): string => {
    return JSON.stringify(favoriteIds);
  }, [favoriteIds]);

  const importFavorites = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        setFavoriteIds((prev) => {
          const combined = [...new Set([...prev, ...imported])];
          return combined;
        });
        return true;
      }
    } catch {
      // Invalid JSON
    }
    return false;
  }, []);

  return {
    favoriteIds,
    favoriteCount: favoriteIds.length,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteVoicings,
    clearAll,
    exportFavorites,
    importFavorites,
  };
}

export default useFavorites;
