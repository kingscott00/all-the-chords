import {
  ChordVoicing,
  MasterChordShape,
  Barre,
  CHORD_TYPE_INFO,
} from "../types";
import {
  getSemitoneDistance,
  getNoteAtPosition,
  parseRootNote,
  NOTES_SHARP,
  NOTES_FLAT,
} from "../utils/noteUtils";

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
 * Get position label from position number
 */
function getPositionLabel(positionNumber: number): string {
  const suffixes = ["th", "st", "nd", "rd", "th", "th"];
  const suffix = suffixes[positionNumber] || "th";
  return `${positionNumber}${suffix} Position`;
}

/**
 * Transpose a master chord shape to a target root
 */
export function transposeShape(
  shape: MasterChordShape,
  targetRoot: string,
  preferFlat: boolean = false
): ChordVoicing | null {
  const sourceRoot = parseRootNote(shape.masterRoot);
  const target = parseRootNote(targetRoot);
  const semitoneShift = getSemitoneDistance(sourceRoot, target);

  // Calculate the new fret positions
  const newStrings: (number | null)[] = shape.relativeFrets.map((fret) => {
    if (fret === null) return null;
    if (fret === 0 && shape.usesOpenStrings) {
      // Open string becomes fretted at the semitone shift position
      return semitoneShift === 0 ? 0 : semitoneShift;
    }
    return fret + semitoneShift;
  });

  // Find the starting fret (lowest non-null, non-zero fret)
  const frettedNotes = newStrings.filter(
    (f): f is number => f !== null && f > 0
  );
  if (frettedNotes.length === 0 && !newStrings.includes(0)) {
    return null; // No playable notes
  }

  const startingFret =
    frettedNotes.length > 0 ? Math.min(...frettedNotes) : 1;

  // Check if any frets are negative (can't play below nut)
  if (frettedNotes.some((f) => f < 0)) {
    return null;
  }

  // Check if the chord spans too many frets (more than 4 is usually impractical)
  const maxFret = frettedNotes.length > 0 ? Math.max(...frettedNotes) : 0;
  if (maxFret - startingFret > 4) {
    return null;
  }

  // Transpose barre positions
  const newBarres: Barre[] = shape.barres
    ? shape.barres.map((barre) => ({
        ...barre,
        fret: barre.fret + semitoneShift,
      }))
    : [];

  // Calculate actual note names for each string
  const notes: string[] = [];
  const intervals: string[] = [];
  const chordInfo = CHORD_TYPE_INFO[shape.chordType];

  newStrings.forEach((fret, stringIndex) => {
    if (fret !== null) {
      const noteName = getNoteAtPosition(stringIndex, fret, preferFlat);
      notes.push(noteName);

      // Calculate interval from root
      const noteSemitone = NOTE_TO_SEMITONE[noteName] ?? NOTE_TO_SEMITONE[parseRootNote(noteName)];
      const rootSemitone = NOTE_TO_SEMITONE[target];
      const interval = (noteSemitone - rootSemitone + 12) % 12;
      intervals.push(getIntervalName(interval, chordInfo.intervals));
    }
  });

  // Determine bass note
  const firstPlayedString = newStrings.findIndex((f) => f !== null);
  const bassNote =
    firstPlayedString >= 0
      ? getNoteAtPosition(firstPlayedString, newStrings[firstPlayedString]!, preferFlat)
      : target;

  const isInversion = bassNote !== target;

  // Calculate inversion number
  let inversionNumber: number | undefined;
  if (isInversion && chordInfo.intervals.length > 0) {
    const bassInterval = (NOTE_TO_SEMITONE[bassNote] - NOTE_TO_SEMITONE[target] + 12) % 12;
    // Simplified inversion detection
    if (bassInterval === 3 || bassInterval === 4) inversionNumber = 1; // 3rd in bass
    else if (bassInterval === 7) inversionNumber = 2; // 5th in bass
    else if (bassInterval === 10 || bassInterval === 11) inversionNumber = 3; // 7th in bass
  }

  // Get display name for root
  const rootSemitone = NOTE_TO_SEMITONE[target];
  const displayRoot = preferFlat ? NOTES_FLAT[rootSemitone] : NOTES_SHARP[rootSemitone];
  const alternateRoot = preferFlat ? NOTES_SHARP[rootSemitone] : NOTES_FLAT[rootSemitone];

  // Generate unique ID
  const id = `${target.toLowerCase().replace("#", "s").replace("b", "b")}-${shape.chordType}-${shape.cagedShape?.toLowerCase() || "pos"}-${shape.positionNumber}`;

  // Update root string indices based on transposition
  const rootStringIndices = shape.rootStringIndices.filter((idx) => {
    const fret = newStrings[idx];
    if (fret === null) return false;
    const noteAtPos = getNoteAtPosition(idx, fret, preferFlat);
    const noteSemitone = NOTE_TO_SEMITONE[noteAtPos] ?? NOTE_TO_SEMITONE[parseRootNote(noteAtPos)];
    return noteSemitone === NOTE_TO_SEMITONE[target];
  });

  return {
    id,
    root: displayRoot,
    rootAlternate: displayRoot !== alternateRoot ? alternateRoot : undefined,
    chordType: shape.chordType,
    category: shape.category,
    subcategory: shape.subcategory,
    cagedShape: shape.cagedShape,
    positionNumber: shape.positionNumber,
    positionLabel: getPositionLabel(shape.positionNumber),
    startingFret,
    strings: newStrings,
    fingers: shape.fingers,
    barres: newBarres.length > 0 ? newBarres : undefined,
    rootStringIndices,
    bassNote,
    isInversion,
    inversionNumber,
    notes,
    intervals,
    difficulty: shape.difficulty,
    commonUsage: shape.commonUsage,
  };
}

/**
 * Convert semitone interval to interval name
 */
function getIntervalName(semitones: number, chordIntervals: string[]): string {
  const intervalMap: Record<number, string[]> = {
    0: ["1", "R"],
    1: ["b2", "b9"],
    2: ["2", "9"],
    3: ["b3", "#9"],
    4: ["3"],
    5: ["4", "11"],
    6: ["b5", "#11"],
    7: ["5"],
    8: ["b6", "#5"],
    9: ["6", "13"],
    10: ["b7"],
    11: ["7"],
  };

  const possible = intervalMap[semitones] || [semitones.toString()];

  // Try to match with expected chord intervals
  for (const interval of possible) {
    if (chordIntervals.includes(interval)) {
      return interval;
    }
  }

  return possible[0];
}

/**
 * Generate all voicings for a target root from master shapes
 */
export function generateVoicingsForRoot(
  shapes: MasterChordShape[],
  targetRoot: string,
  preferFlat: boolean = false
): ChordVoicing[] {
  const voicings: ChordVoicing[] = [];

  for (const shape of shapes) {
    const voicing = transposeShape(shape, targetRoot, preferFlat);
    if (voicing) {
      voicings.push(voicing);
    }
  }

  return voicings;
}
