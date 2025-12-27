import { useState, useMemo, useCallback } from "react";
import { ChordVoicing, ChordType, ROOT_NOTES, CHORD_TYPE_INFO } from "../types";
import { getVoicingsForRoot } from "../data/chordDatabase";
import { parseRootNote } from "../utils/noteUtils";

export interface SearchResult {
  voicing: ChordVoicing;
  matchScore: number;
  matchedOn: string;
}

// Chord name aliases for fuzzy matching
const CHORD_ALIASES: Record<string, string[]> = {
  maj: ["major", "M", ""],
  min: ["minor", "m", "-"],
  "7": ["dom7", "dominant7", "dominant", "dom"],
  maj7: ["major7", "M7", "Δ7", "delta7", "Δ"],
  m7: ["min7", "minor7", "-7"],
  dim: ["diminished", "°", "o"],
  aug: ["augmented", "+", "#5"],
  sus2: ["suspended2", "sus 2"],
  sus4: ["suspended4", "sus 4", "sus"],
  m7b5: ["half-diminished", "halfdim", "ø", "half diminished", "min7b5"],
  dim7: ["diminished7", "°7", "o7", "full diminished"],
  "7#5": ["aug7", "augmented7", "+7", "7+"],
  maj9: ["major9", "M9", "Δ9"],
  "9": ["dom9", "dominant9"],
  m9: ["min9", "minor9", "-9"],
  maj11: ["major11", "M11", "Δ11"],
  "11": ["dom11", "dominant11"],
  m11: ["min11", "minor11", "-11"],
  maj13: ["major13", "M13", "Δ13"],
  "13": ["dom13", "dominant13"],
  m13: ["min13", "minor13", "-13"],
};

// Root note aliases
const ROOT_ALIASES: Record<string, string[]> = {
  A: ["a"],
  "A#": ["a#", "asharp", "a sharp", "bb", "bflat", "b flat"],
  Bb: ["bb", "bflat", "b flat", "a#", "asharp", "a sharp"],
  B: ["b"],
  C: ["c"],
  "C#": ["c#", "csharp", "c sharp", "db", "dflat", "d flat"],
  Db: ["db", "dflat", "d flat", "c#", "csharp", "c sharp"],
  D: ["d"],
  "D#": ["d#", "dsharp", "d sharp", "eb", "eflat", "e flat"],
  Eb: ["eb", "eflat", "e flat", "d#", "dsharp", "d sharp"],
  E: ["e"],
  F: ["f"],
  "F#": ["f#", "fsharp", "f sharp", "gb", "gflat", "g flat"],
  Gb: ["gb", "gflat", "g flat", "f#", "fsharp", "f sharp"],
  G: ["g"],
  "G#": ["g#", "gsharp", "g sharp", "ab", "aflat", "a flat"],
  Ab: ["ab", "aflat", "a flat", "g#", "gsharp", "g sharp"],
};

function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, " ");
}

function parseChordQuery(query: string): { root: string | null; type: string | null } {
  const normalized = normalizeQuery(query);

  // Try to extract root note (1-2 characters at start)
  let root: string | null = null;
  let remaining = normalized;

  // Check for 2-char roots first (with sharp/flat)
  const twoCharRoot = normalized.slice(0, 2);
  for (const [canonical, aliases] of Object.entries(ROOT_ALIASES)) {
    if (aliases.some(a => a === twoCharRoot || twoCharRoot.startsWith(a))) {
      root = canonical;
      remaining = normalized.slice(2).trim();
      break;
    }
  }

  // If no 2-char match, try 1-char
  if (!root) {
    const oneCharRoot = normalized.slice(0, 1);
    for (const [canonical, aliases] of Object.entries(ROOT_ALIASES)) {
      if (aliases.some(a => a === oneCharRoot)) {
        root = canonical;
        remaining = normalized.slice(1).trim();
        break;
      }
    }
  }

  return { root, type: remaining || null };
}

function matchChordType(typeQuery: string, chordType: ChordType): number {
  if (!typeQuery) return 0.5; // Partial match if no type specified

  const normalized = normalizeQuery(typeQuery);
  const info = CHORD_TYPE_INFO[chordType];

  // Exact match on short name
  if (info.shortName.toLowerCase() === normalized) return 1;

  // Exact match on full name
  if (info.name.toLowerCase() === normalized) return 0.95;

  // Check aliases
  const aliases = CHORD_ALIASES[info.shortName] || [];
  for (const alias of aliases) {
    if (alias.toLowerCase() === normalized) return 0.9;
  }

  // Partial match
  if (info.shortName.toLowerCase().includes(normalized) ||
      info.name.toLowerCase().includes(normalized)) {
    return 0.7;
  }

  // Check if any alias contains the query
  for (const alias of aliases) {
    if (alias.toLowerCase().includes(normalized)) return 0.6;
  }

  return 0;
}

export function useSearch() {
  const [query, setQuery] = useState("");
  const [isSearching] = useState(false);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];

    const { root, type } = parseChordQuery(query);
    const searchResults: SearchResult[] = [];

    // If we found a root, search that root's voicings
    if (root) {
      // Find the matching ROOT_NOTES entry
      const rootEntry = ROOT_NOTES.find(r => {
        const parsed = parseRootNote(r);
        const parsedFlat = parseRootNote(r, true);
        return parsed === root || parsedFlat === root ||
               parsed.replace("#", "").replace("b", "") === root.replace("#", "").replace("b", "");
      });

      if (rootEntry) {
        const voicings = getVoicingsForRoot(rootEntry);

        for (const voicing of voicings) {
          const typeScore = matchChordType(type || "", voicing.chordType);
          if (typeScore > 0) {
            searchResults.push({
              voicing,
              matchScore: typeScore,
              matchedOn: type ? `${root} ${type}` : root,
            });
          }
        }
      }
    } else {
      // No root found, search all roots for type matches
      for (const rootNote of ROOT_NOTES) {
        const voicings = getVoicingsForRoot(rootNote);

        for (const voicing of voicings) {
          const typeScore = matchChordType(query, voicing.chordType);
          if (typeScore > 0.5) {
            searchResults.push({
              voicing,
              matchScore: typeScore * 0.8, // Lower score since no root match
              matchedOn: query,
            });
          }
        }
      }
    }

    // Sort by score descending, then by root, then by position
    searchResults.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (a.voicing.root !== b.voicing.root) {
        return a.voicing.root.localeCompare(b.voicing.root);
      }
      return a.voicing.positionNumber - b.voicing.positionNumber;
    });

    // Limit results
    return searchResults.slice(0, 50);
  }, [query]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    results,
    isSearching,
    search,
    clearSearch,
    hasResults: results.length > 0,
  };
}

export default useSearch;
