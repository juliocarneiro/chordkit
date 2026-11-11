import { accidentalOf, noteFromIndex, noteIndex } from './notes'
import type { NoteStyle } from './notes'

export type ScaleType =
  | 'major'
  | 'minor'
  | 'harmonicMinor'
  | 'melodicMinor'
  | 'pentatonicMajor'
  | 'pentatonicMinor'
  | 'blues'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'locrian'

/** Interval patterns (semitones from root) for each scale type */
const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major:           [0, 2, 4, 5, 7, 9, 11],
  minor:           [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor:   [0, 2, 3, 5, 7, 8, 11],
  melodicMinor:    [0, 2, 3, 5, 7, 9, 11],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues:           [0, 3, 5, 6, 7, 10],
  dorian:          [0, 2, 3, 5, 7, 9, 10],
  phrygian:        [0, 1, 3, 5, 7, 8, 10],
  lydian:          [0, 2, 4, 6, 7, 9, 11],
  mixolydian:      [0, 2, 4, 5, 7, 9, 10],
  locrian:         [0, 1, 3, 5, 6, 8, 10],
}

/** Semitones from the root of a scale up to the major key that shares its key signature */
const RELATIVE_MAJOR_OFFSET: Record<ScaleType, number> = {
  major: 0,
  pentatonicMajor: 0,
  minor: 3,
  harmonicMinor: 3,
  melodicMinor: 3,
  pentatonicMinor: 3,
  blues: 3,
  dorian: 10,
  phrygian: 8,
  lydian: 7,
  mixolydian: 5,
  locrian: 1,
}

/** Major keys whose signature is written with flats: F, Bb, Eb, Ab, Db, Gb */
const FLAT_MAJOR_KEYS = new Set([5, 10, 3, 8, 1, 6])

/**
 * Accidental style a key is conventionally written in.
 * A root spelled with an accidental keeps it (Bb gives flats, F# gives sharps);
 * a natural root follows its key signature (F major and D minor use flats).
 */
export function preferredStyle(root: string, type: ScaleType = 'major'): NoteStyle {
  const written = accidentalOf(root)
  if (written) return written
  const relativeMajor = (noteIndex(root) + RELATIVE_MAJOR_OFFSET[type]) % 12
  return FLAT_MAJOR_KEYS.has(relativeMajor) ? 'flat' : 'sharp'
}

/**
 * Returns the notes of a scale.
 * @param root - Root note (e.g. 'A', 'C#', 'Bb')
 * @param type - Scale type (default: 'major')
 * @param style - Accidental preference (default: the conventional spelling of the key)
 */
export function getScale(root: string, type: ScaleType = 'major', style?: NoteStyle): string[] {
  const intervals = SCALE_INTERVALS[type]
  const rootIdx = noteIndex(root)
  const resolvedStyle: NoteStyle = style ?? preferredStyle(root, type)
  return intervals.map((interval) => noteFromIndex(rootIdx + interval, resolvedStyle))
}

/** Returns all available scale type identifiers */
export function getScaleTypes(): ScaleType[] {
  return Object.keys(SCALE_INTERVALS) as ScaleType[]
}
