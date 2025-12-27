// Chord Type Enum - all chord types supported
export enum ChordType {
  MAJOR = "maj",
  MINOR = "min",
  AUGMENTED = "aug",
  DIMINISHED = "dim",
  SUS2 = "sus2",
  SUS4 = "sus4",
  MAJOR_7 = "maj7",
  DOMINANT_7 = "7",
  MINOR_7 = "m7",
  HALF_DIMINISHED = "m7b5",
  DIMINISHED_7 = "dim7",
  AUGMENTED_7 = "7#5",
  MAJOR_9 = "maj9",
  DOMINANT_9 = "9",
  MINOR_9 = "m9",
  MAJOR_11 = "maj11",
  DOMINANT_11 = "11",
  MINOR_11 = "m11",
  MAJOR_13 = "maj13",
  DOMINANT_13 = "13",
  MINOR_13 = "m13",
}

// Chord Category Enum
export enum ChordCategory {
  TRIAD = "triad",
  SEVENTH = "seventh",
  EXTENDED = "extended",
}

// Root notes
export const ROOT_NOTES = [
  "A",
  "A#/Bb",
  "B",
  "C",
  "C#/Db",
  "D",
  "D#/Eb",
  "E",
  "F",
  "F#/Gb",
  "G",
  "G#/Ab",
] as const;

export type RootNote = (typeof ROOT_NOTES)[number];

// CAGED shapes
export type CAGEDShape = "C" | "A" | "G" | "E" | "D";

// Barre definition
export interface Barre {
  fret: number;
  fromString: number; // 0-5, 0 is low E
  toString: number; // 0-5, 5 is high E
  finger: number; // Usually 1 for index finger
}

// Main chord voicing interface
export interface ChordVoicing {
  id: string; // Unique identifier like "a-maj-caged-e-pos1"
  root: string; // "A", "Bb", "C#", etc.
  rootAlternate?: string; // "A#" if root is "Bb", for enharmonic display
  chordType: ChordType;
  category: ChordCategory;
  subcategory?: string; // "shell", "drop2", "drop3", "caged"
  cagedShape?: CAGEDShape; // "C", "A", "G", "E", "D" if applicable
  positionNumber: number; // 1-5 for position grouping
  positionLabel: string; // "1st Position", "2nd Position", etc.
  startingFret: number; // The fret number for Roman numeral display
  strings: (number | null)[]; // [null, 0, 2, 2, 2, 0] - null=muted, 0=open, n=fret
  fingers?: (number | null)[]; // [null, 0, 1, 2, 3, 0] - finger numbers 1-4, 0=open, null=muted
  barres?: Barre[]; // Array of barre definitions
  rootStringIndices: number[]; // Which strings contain the root note
  bassNote: string; // The lowest sounding note (for inversions)
  isInversion: boolean; // True if bass note is not the root
  inversionNumber?: number; // 1st inversion, 2nd inversion, etc.
  notes: string[]; // Actual note names sounded low to high ["A", "E", "A", "C#", "E", "A"]
  intervals: string[]; // Intervals from root ["1", "5", "1", "3", "5", "1"]
  difficulty: number; // 1-5 rating for fingering difficulty
  commonUsage: boolean; // Flag for most commonly used voicings
}

// Master chord shape for transposition system
export interface MasterChordShape {
  chordType: ChordType;
  category: ChordCategory;
  subcategory?: string;
  cagedShape?: CAGEDShape;
  positionNumber: number;
  masterRoot: string; // The root this shape is defined for
  relativeFrets: (number | null)[]; // Fret numbers relative to root position
  fingers?: (number | null)[];
  barres?: Barre[];
  rootStringIndices: number[];
  usesOpenStrings: boolean;
  transposable: boolean; // False for open-position-only voicings
  difficulty: number;
  commonUsage: boolean;
}

// Chord diagram component props
export interface ChordDiagramProps {
  voicing: ChordVoicing;
  size?: "small" | "medium" | "large";
  width?: number;
  showFingers?: boolean;
  showNoteNames?: boolean;
  showIntervals?: boolean;
  highlightRoot?: boolean;
  interactive?: boolean;
  onPlay?: () => void;
  className?: string;
}

// App state
export interface AppState {
  // Navigation
  selectedRoot: string;
  selectedCategory: ChordCategory | null;
  selectedChordType: ChordType | null;
  selectedSubcategory: string | null;
  positionFilter: number | null; // 1-5 or null for all

  // UI
  sidebarOpen: boolean;
  comparisonVoicings: string[]; // IDs of voicings being compared
  searchQuery: string;

  // Preferences
  namingConvention: "sharp" | "flat";
  showFingerNumbers: boolean;
  audioEnabled: boolean;
  audioVolume: number;
  theme: "light" | "dark" | "system";

  // Data
  favorites: string[];
  recentlyViewed: string[];
}

// Search result
export interface SearchResult {
  voicing: ChordVoicing;
  matchScore: number;
  matchedOn: string;
}

// Chord type display info
export interface ChordTypeInfo {
  type: ChordType;
  name: string;
  shortName: string;
  category: ChordCategory;
  intervals: string[];
}

// Map chord types to their display info
export const CHORD_TYPE_INFO: Record<ChordType, ChordTypeInfo> = {
  [ChordType.MAJOR]: {
    type: ChordType.MAJOR,
    name: "Major",
    shortName: "",
    category: ChordCategory.TRIAD,
    intervals: ["1", "3", "5"],
  },
  [ChordType.MINOR]: {
    type: ChordType.MINOR,
    name: "Minor",
    shortName: "m",
    category: ChordCategory.TRIAD,
    intervals: ["1", "b3", "5"],
  },
  [ChordType.AUGMENTED]: {
    type: ChordType.AUGMENTED,
    name: "Augmented",
    shortName: "aug",
    category: ChordCategory.TRIAD,
    intervals: ["1", "3", "#5"],
  },
  [ChordType.DIMINISHED]: {
    type: ChordType.DIMINISHED,
    name: "Diminished",
    shortName: "dim",
    category: ChordCategory.TRIAD,
    intervals: ["1", "b3", "b5"],
  },
  [ChordType.SUS2]: {
    type: ChordType.SUS2,
    name: "Suspended 2",
    shortName: "sus2",
    category: ChordCategory.TRIAD,
    intervals: ["1", "2", "5"],
  },
  [ChordType.SUS4]: {
    type: ChordType.SUS4,
    name: "Suspended 4",
    shortName: "sus4",
    category: ChordCategory.TRIAD,
    intervals: ["1", "4", "5"],
  },
  [ChordType.MAJOR_7]: {
    type: ChordType.MAJOR_7,
    name: "Major 7th",
    shortName: "maj7",
    category: ChordCategory.SEVENTH,
    intervals: ["1", "3", "5", "7"],
  },
  [ChordType.DOMINANT_7]: {
    type: ChordType.DOMINANT_7,
    name: "Dominant 7th",
    shortName: "7",
    category: ChordCategory.SEVENTH,
    intervals: ["1", "3", "5", "b7"],
  },
  [ChordType.MINOR_7]: {
    type: ChordType.MINOR_7,
    name: "Minor 7th",
    shortName: "m7",
    category: ChordCategory.SEVENTH,
    intervals: ["1", "b3", "5", "b7"],
  },
  [ChordType.HALF_DIMINISHED]: {
    type: ChordType.HALF_DIMINISHED,
    name: "Half-Diminished",
    shortName: "m7b5",
    category: ChordCategory.SEVENTH,
    intervals: ["1", "b3", "b5", "b7"],
  },
  [ChordType.DIMINISHED_7]: {
    type: ChordType.DIMINISHED_7,
    name: "Diminished 7th",
    shortName: "dim7",
    category: ChordCategory.SEVENTH,
    intervals: ["1", "b3", "b5", "bb7"],
  },
  [ChordType.AUGMENTED_7]: {
    type: ChordType.AUGMENTED_7,
    name: "Augmented 7th",
    shortName: "7#5",
    category: ChordCategory.SEVENTH,
    intervals: ["1", "3", "#5", "b7"],
  },
  [ChordType.MAJOR_9]: {
    type: ChordType.MAJOR_9,
    name: "Major 9th",
    shortName: "maj9",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "3", "5", "7", "9"],
  },
  [ChordType.DOMINANT_9]: {
    type: ChordType.DOMINANT_9,
    name: "Dominant 9th",
    shortName: "9",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "3", "5", "b7", "9"],
  },
  [ChordType.MINOR_9]: {
    type: ChordType.MINOR_9,
    name: "Minor 9th",
    shortName: "m9",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "b3", "5", "b7", "9"],
  },
  [ChordType.MAJOR_11]: {
    type: ChordType.MAJOR_11,
    name: "Major 11th",
    shortName: "maj11",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "3", "5", "7", "9", "11"],
  },
  [ChordType.DOMINANT_11]: {
    type: ChordType.DOMINANT_11,
    name: "Dominant 11th",
    shortName: "11",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "3", "5", "b7", "9", "11"],
  },
  [ChordType.MINOR_11]: {
    type: ChordType.MINOR_11,
    name: "Minor 11th",
    shortName: "m11",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "b3", "5", "b7", "9", "11"],
  },
  [ChordType.MAJOR_13]: {
    type: ChordType.MAJOR_13,
    name: "Major 13th",
    shortName: "maj13",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "3", "5", "7", "9", "13"],
  },
  [ChordType.DOMINANT_13]: {
    type: ChordType.DOMINANT_13,
    name: "Dominant 13th",
    shortName: "13",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "3", "5", "b7", "9", "13"],
  },
  [ChordType.MINOR_13]: {
    type: ChordType.MINOR_13,
    name: "Minor 13th",
    shortName: "m13",
    category: ChordCategory.EXTENDED,
    intervals: ["1", "b3", "5", "b7", "9", "13"],
  },
};
