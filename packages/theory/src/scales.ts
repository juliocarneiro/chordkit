import { noteFromIndex, noteIndex } from './notes'
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

/**
 * Returns the notes of a scale.
 * @param root - Root note (e.g. 'A', 'C#', 'Bb')
 * @param type - Scale type (default: 'major')
 * @param style - Accidental preference (default: inferred from root)
 */
export function getScale(root: string, type: ScaleType = 'major', style?: NoteStyle): string[] {
  const intervals = SCALE_INTERVALS[type]
  const rootIdx = noteIndex(root)
  const resolvedStyle: NoteStyle = style ?? (root.includes('b') ? 'flat' : 'sharp')
  return intervals.map((interval) => noteFromIndex(rootIdx + interval, resolvedStyle))
}

/** Returns all available scale type identifiers */
export function getScaleTypes(): ScaleType[] {
  return Object.keys(SCALE_INTERVALS) as ScaleType[]
}
