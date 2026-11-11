export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const

export type NoteStyle = 'sharp' | 'flat'

const ENHARMONIC_MAP: Record<string, string> = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#',
}

const LETTER_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const NOTE_PATTERN = /^([A-Ga-g])([#♯b♭]*)$/

/**
 * Returns the chromatic index (0–11) of a note name.
 * The letter is case-insensitive and may be followed by sharps (# ♯) or flats (b ♭),
 * so Cb is B, E# is F and "bb" is B flat.
 * @throws if the string is not a note name
 */
export function noteIndex(note: string): number {
  const match = NOTE_PATTERN.exec(note.trim())
  if (!match) throw new Error(`Invalid note name: "${note}"`)
  let idx = LETTER_INDEX[match[1].toUpperCase()]
  for (const accidental of match[2]) {
    idx += accidental === '#' || accidental === '♯' ? 1 : -1
  }
  return ((idx % 12) + 12) % 12
}

/** Which accidental a note name is written with, or null for a natural (or invalid) name */
export function accidentalOf(note: string): NoteStyle | null {
  const match = NOTE_PATTERN.exec(note.trim())
  if (!match || !match[2]) return null
  return match[2][0] === '#' || match[2][0] === '♯' ? 'sharp' : 'flat'
}

/** Returns the note name at a given chromatic index */
export function noteFromIndex(index: number, style: NoteStyle = 'sharp'): string {
  const i = ((index % 12) + 12) % 12
  return style === 'flat' ? NOTES_FLAT[i] : NOTES_SHARP[i]
}

/** Returns the enharmonic equivalent of a note (e.g. C# ↔ Db). Natural notes are returned as-is. */
export function enharmonic(note: string): string {
  return ENHARMONIC_MAP[note.trim()] ?? note.trim()
}

/** Returns the number of semitones between two notes (0–11, always positive, upward direction) */
export function semitonesBetween(from: string, to: string): number {
  const diff = noteIndex(to) - noteIndex(from)
  return ((diff % 12) + 12) % 12
}

/**
 * Transposes a single note by N semitones (positive = up, negative = down).
 * Without an explicit style the result keeps the accidental the input was written with.
 */
export function transposeNote(note: string, semitones: number, style?: NoteStyle): string {
  const resolvedStyle: NoteStyle = style ?? accidentalOf(note) ?? 'sharp'
  return noteFromIndex(noteIndex(note) + semitones, resolvedStyle)
}

/** Returns the 12 notes in circle-of-fifths order */
export function circleOfFifths(): string[] {
  return ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
}
