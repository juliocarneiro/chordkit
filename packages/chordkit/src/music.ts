const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const LETTER_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

export type NoteStyle = 'sharp' | 'flat'

/**
 * Chromatic index (0–11) of a note name, or null when the string is not a note.
 * The letter is case-insensitive; any run of sharps (# ♯) or flats (b ♭) may follow it,
 * so enharmonic spellings such as Cb, E# or Bbb resolve to the pitch they sound.
 */
export function parseNote(note: string): number | null {
  const match = /^([A-Ga-g])([#♯b♭]*)$/.exec(note.trim())
  if (!match) return null
  let index = LETTER_INDEX[match[1].toUpperCase()]
  for (const accidental of match[2]) {
    index += accidental === '#' || accidental === '♯' ? 1 : -1
  }
  return ((index % 12) + 12) % 12
}

/**
 * Given an open string note and a fret number, return the sounding note name.
 * Returns an empty string when `openNote` is not a note name.
 */
export function noteAtFret(openNote: string, fret: number, style: NoteStyle = 'sharp'): string {
  const base = parseNote(openNote)
  if (base === null) return ''
  const idx = (((base + fret) % 12) + 12) % 12
  return style === 'flat' ? NOTES_FLAT[idx] : NOTES_SHARP[idx]
}

/**
 * Given a tuning array and string/fret position, return the note name.
 * Tuning is indexed from lowest string (index 0) to highest.
 * String numbers are 1-based where 1 = highest pitch.
 */
export function noteForFinger(
  tuning: string[],
  totalStrings: number,
  stringNum: number,
  fret: number,
  position: number,
  style: NoteStyle = 'sharp',
): string {
  const tuningIndex = totalStrings - stringNum
  const openNote = tuning[tuningIndex]
  if (!openNote) return ''
  const absoluteFret = fret + (position - 1)
  return noteAtFret(openNote, absoluteFret, style)
}
