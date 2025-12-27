// Standard guitar tuning: E2, A2, D3, G3, B3, E4
// String indices: 0 = low E (6th string), 5 = high E (1st string)
export const STANDARD_TUNING = ["E", "A", "D", "G", "B", "E"];
export const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64]; // MIDI note numbers

// All 12 chromatic notes with sharp names
export const NOTES_SHARP = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
];

// All 12 chromatic notes with flat names
export const NOTES_FLAT = [
  "A",
  "Bb",
  "B",
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
];

// Map note names to semitone offset from A
const NOTE_TO_SEMITONE: Record<string, number> = {
  A: 0,
  "A#": 1,
  Bb: 1,
  B: 2,
  C: 3,
  "C#": 4,
  Db: 4,
  D: 5,
  "D#": 6,
  Eb: 6,
  E: 7,
  F: 8,
  "F#": 9,
  Gb: 9,
  G: 10,
  "G#": 11,
  Ab: 11,
};

/**
 * Get the note name at a specific string and fret
 */
export function getNoteAtPosition(
  stringIndex: number,
  fret: number,
  preferFlat: boolean = false
): string {
  const openNote = STANDARD_TUNING[stringIndex];
  const openSemitone = NOTE_TO_SEMITONE[openNote];
  const targetSemitone = (openSemitone + fret) % 12;

  return preferFlat ? NOTES_FLAT[targetSemitone] : NOTES_SHARP[targetSemitone];
}

/**
 * Get the MIDI note number at a specific string and fret
 */
export function getMidiNote(stringIndex: number, fret: number): number {
  return STANDARD_TUNING_MIDI[stringIndex] + fret;
}

/**
 * Convert MIDI note to frequency in Hz
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Get note name from MIDI number
 */
export function midiToNoteName(
  midi: number,
  preferFlat: boolean = false
): string {
  const noteIndex = midi % 12;
  // MIDI note 0 is C, so we need to adjust
  const adjustedIndex = (noteIndex + 9) % 12; // Shift to A = 0
  const octave = Math.floor(midi / 12) - 1;
  const noteName = preferFlat
    ? NOTES_FLAT[adjustedIndex]
    : NOTES_SHARP[adjustedIndex];
  return `${noteName}${octave}`;
}

/**
 * Calculate semitone difference between two roots
 */
export function getSemitoneDistance(fromRoot: string, toRoot: string): number {
  const from = NOTE_TO_SEMITONE[fromRoot];
  const to = NOTE_TO_SEMITONE[toRoot];

  if (from === undefined || to === undefined) {
    throw new Error(`Invalid note: ${fromRoot} or ${toRoot}`);
  }

  // Positive = move up the fretboard
  let distance = to - from;
  if (distance < 0) {
    distance += 12;
  }
  return distance;
}

/**
 * Get the canonical (sharp-preferring) note name
 */
export function canonicalNoteName(note: string): string {
  const semitone = NOTE_TO_SEMITONE[note];
  if (semitone === undefined) {
    return note;
  }
  return NOTES_SHARP[semitone];
}

/**
 * Get both enharmonic names for a note (or just the note if natural)
 */
export function getEnharmonicPair(note: string): [string, string | null] {
  const semitone = NOTE_TO_SEMITONE[note];
  if (semitone === undefined) {
    return [note, null];
  }

  const sharp = NOTES_SHARP[semitone];
  const flat = NOTES_FLAT[semitone];

  if (sharp === flat) {
    return [sharp, null];
  }
  return [sharp, flat];
}

/**
 * Parse a root note string that may contain enharmonic notation (e.g., "A#/Bb")
 */
export function parseRootNote(
  rootString: string,
  preferFlat: boolean = false
): string {
  if (rootString.includes("/")) {
    const [sharp, flat] = rootString.split("/");
    return preferFlat ? flat : sharp;
  }
  return rootString;
}

/**
 * Format chord name for display
 */
export function formatChordName(
  root: string,
  chordTypeName: string,
  preferFlat: boolean = false
): string {
  const displayRoot = preferFlat
    ? NOTES_FLAT[NOTE_TO_SEMITONE[canonicalNoteName(root)]]
    : NOTES_SHARP[NOTE_TO_SEMITONE[canonicalNoteName(root)]];
  return `${displayRoot}${chordTypeName}`;
}
