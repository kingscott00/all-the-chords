import { ChordVoicing, ChordType, ChordCategory, ROOT_NOTES } from "../types";
import { TRIADS, SEVENTHS, EXTENDED } from "./masterShapes";
import { generateVoicingsForRoot } from "./transpose";
import { parseRootNote } from "../utils/noteUtils";

// Cache for generated voicings
const voicingCache: Map<string, ChordVoicing[]> = new Map();

/**
 * Get all voicings for a specific root note
 */
export function getVoicingsForRoot(
  rootNote: string,
  preferFlat: boolean = false
): ChordVoicing[] {
  const cacheKey = `${rootNote}-${preferFlat}`;

  if (voicingCache.has(cacheKey)) {
    return voicingCache.get(cacheKey)!;
  }

  const root = parseRootNote(rootNote, preferFlat);
  const allShapes = [...TRIADS, ...SEVENTHS, ...EXTENDED];
  const voicings = generateVoicingsForRoot(allShapes, root, preferFlat);

  // Sort by chord type, then by position number
  voicings.sort((a, b) => {
    const typeOrder = getChordTypeOrder(a.chordType) - getChordTypeOrder(b.chordType);
    if (typeOrder !== 0) return typeOrder;
    return a.positionNumber - b.positionNumber;
  });

  voicingCache.set(cacheKey, voicings);
  return voicings;
}

/**
 * Get voicings filtered by chord type
 */
export function getVoicingsByType(
  rootNote: string,
  chordType: ChordType,
  preferFlat: boolean = false
): ChordVoicing[] {
  const allVoicings = getVoicingsForRoot(rootNote, preferFlat);
  return allVoicings.filter((v) => v.chordType === chordType);
}

/**
 * Get voicings filtered by category
 */
export function getVoicingsByCategory(
  rootNote: string,
  category: ChordCategory,
  preferFlat: boolean = false
): ChordVoicing[] {
  const allVoicings = getVoicingsForRoot(rootNote, preferFlat);
  return allVoicings.filter((v) => v.category === category);
}

/**
 * Get a specific voicing by ID
 */
export function getVoicingById(id: string): ChordVoicing | undefined {
  // Search through all roots
  for (const root of ROOT_NOTES) {
    const voicings = getVoicingsForRoot(root);
    const voicing = voicings.find((v) => v.id === id);
    if (voicing) return voicing;
  }
  return undefined;
}

/**
 * Get all available chord types for a root
 */
export function getAvailableChordTypes(rootNote: string): ChordType[] {
  const voicings = getVoicingsForRoot(rootNote);
  const types = new Set<ChordType>();
  voicings.forEach((v) => types.add(v.chordType));
  return Array.from(types).sort(
    (a, b) => getChordTypeOrder(a) - getChordTypeOrder(b)
  );
}

/**
 * Define chord type ordering
 */
function getChordTypeOrder(type: ChordType): number {
  const order: Record<ChordType, number> = {
    [ChordType.MAJOR]: 1,
    [ChordType.MINOR]: 2,
    [ChordType.AUGMENTED]: 3,
    [ChordType.DIMINISHED]: 4,
    [ChordType.SUS2]: 5,
    [ChordType.SUS4]: 6,
    [ChordType.MAJOR_7]: 10,
    [ChordType.DOMINANT_7]: 11,
    [ChordType.MINOR_7]: 12,
    [ChordType.HALF_DIMINISHED]: 13,
    [ChordType.DIMINISHED_7]: 14,
    [ChordType.AUGMENTED_7]: 15,
    [ChordType.MAJOR_9]: 20,
    [ChordType.DOMINANT_9]: 21,
    [ChordType.MINOR_9]: 22,
    [ChordType.MAJOR_11]: 30,
    [ChordType.DOMINANT_11]: 31,
    [ChordType.MINOR_11]: 32,
    [ChordType.MAJOR_13]: 40,
    [ChordType.DOMINANT_13]: 41,
    [ChordType.MINOR_13]: 42,
  };
  return order[type] ?? 100;
}

/**
 * Group voicings by chord type
 */
export function groupVoicingsByType(
  voicings: ChordVoicing[]
): Map<ChordType, ChordVoicing[]> {
  const grouped = new Map<ChordType, ChordVoicing[]>();

  for (const voicing of voicings) {
    const existing = grouped.get(voicing.chordType) || [];
    existing.push(voicing);
    grouped.set(voicing.chordType, existing);
  }

  return grouped;
}

/**
 * Group voicings by category
 */
export function groupVoicingsByCategory(
  voicings: ChordVoicing[]
): Map<ChordCategory, ChordVoicing[]> {
  const grouped = new Map<ChordCategory, ChordVoicing[]>();

  for (const voicing of voicings) {
    const existing = grouped.get(voicing.category) || [];
    existing.push(voicing);
    grouped.set(voicing.category, existing);
  }

  return grouped;
}

/**
 * Clear the voicing cache
 */
export function clearCache(): void {
  voicingCache.clear();
}
