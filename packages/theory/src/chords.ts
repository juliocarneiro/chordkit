import { noteFromIndex, noteIndex, semitonesBetween } from './notes'
import type { NoteStyle } from './notes'

export interface DiatonicChord {
  /** Roman numeral degree (I, II, III…) */
  degree: string
  /** Chord name (e.g. 'Am', 'G7') */
  name: string
  /** Chord quality */
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7'
}

/** Interval pattern (semitones from root) for diatonic chord qualities */
type ChordPattern = { intervals: number[]; quality: DiatonicChord['quality'] }

const CHORD_PATTERNS: ChordPattern[] = [
  { intervals: [0, 4, 7],     quality: 'major' },
  { intervals: [0, 3, 7],     quality: 'minor' },
  { intervals: [0, 3, 6],     quality: 'diminished' },
  { intervals: [0, 4, 8],     quality: 'augmented' },
  { intervals: [0, 4, 7, 10], quality: 'dominant7' },
]

const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]

const DEGREES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

function buildDiatonicChord(
  scaleNotes: string[],
  degree: number,
  style: NoteStyle,
): DiatonicChord {
  const root = scaleNotes[degree]
  const third = scaleNotes[(degree + 2) % 7]
  const fifth = scaleNotes[(degree + 4) % 7]

  const thirdInterval = semitonesBetween(root, third)
  const fifthInterval = semitonesBetween(root, fifth)

  let quality: DiatonicChord['quality']
  let nameSuffix = ''

  if (thirdInterval === 4 && fifthInterval === 7) {
    quality = 'major'
    nameSuffix = ''
  } else if (thirdInterval === 3 && fifthInterval === 7) {
    quality = 'minor'
    nameSuffix = 'm'
  } else if (thirdInterval === 3 && fifthInterval === 6) {
    quality = 'diminished'
    nameSuffix = 'dim'
  } else if (thirdInterval === 4 && fifthInterval === 8) {
    quality = 'augmented'
    nameSuffix = 'aug'
  } else {
    quality = 'major'
    nameSuffix = ''
  }

  return {
    degree: DEGREES[degree],
    name: root + nameSuffix,
    quality,
  }
}

/**
 * Returns the 7 diatonic chords for a given root and scale type.
 * @param root - Root note (e.g. 'G', 'A', 'Bb')
 * @param scaleType - 'major' or 'minor' (default: 'major')
 * @param style - Accidental preference
 */
export function getDiatonicChords(
  root: string,
  scaleType: 'major' | 'minor' = 'major',
  style?: NoteStyle,
): DiatonicChord[] {
  const intervals = scaleType === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS
  const rootIdx = noteIndex(root)
  const resolvedStyle: NoteStyle = style ?? (root.includes('b') ? 'flat' : 'sharp')
  const scaleNotes = intervals.map((i) => noteFromIndex(rootIdx + i, resolvedStyle))
  return DEGREES.map((_, idx) => buildDiatonicChord(scaleNotes, idx, resolvedStyle))
}

/**
 * Identifies the chord name from a set of notes.
 * Returns null if no match is found.
 * @param notes - Array of note names (e.g. ['C', 'E', 'G'])
 * @param style - Accidental preference for the root name
 */
export function identifyChord(notes: string[], style?: NoteStyle): string | null {
  if (notes.length < 2) return null

  const indices = notes.map(noteIndex)

  for (const rootIdx of indices) {
    const resolvedStyle: NoteStyle = style ?? 'sharp'
    const root = noteFromIndex(rootIdx, resolvedStyle)
    const intervals = indices.map((i) => ((i - rootIdx + 12) % 12)).sort((a, b) => a - b)

    for (const pattern of CHORD_PATTERNS) {
      const patternSet = new Set(pattern.intervals)
      const intervalsSet = new Set(intervals)
      const matches = pattern.intervals.every((i) => intervalsSet.has(i)) &&
        intervals.every((i) => patternSet.has(i))

      if (matches) {
        const suffix =
          pattern.quality === 'major' ? '' :
          pattern.quality === 'minor' ? 'm' :
          pattern.quality === 'diminished' ? 'dim' :
          pattern.quality === 'augmented' ? 'aug' :
          pattern.quality === 'dominant7' ? '7' : ''
        return root + suffix
      }
    }
  }

  return null
}
