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

/** Returns the chromatic index (0–11) of a note name */
export function noteIndex(note: string): number {
  const upper = note.trim()
  let idx = NOTES_SHARP.indexOf(upper as typeof NOTES_SHARP[number])
  if (idx === -1) idx = NOTES_FLAT.indexOf(upper as typeof NOTES_FLAT[number])
  if (idx === -1) {
    const base = upper.charAt(0).toUpperCase()
    idx = NOTES_SHARP.findIndex((n) => n.charAt(0) === base)
  }
  return idx === -1 ? 0 : idx
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

/** Transposes a single note by N semitones (positive = up, negative = down) */
export function transposeNote(note: string, semitones: number, style?: NoteStyle): string {
  const resolvedStyle: NoteStyle = style ?? (NOTES_FLAT.includes(note.trim() as typeof NOTES_FLAT[number]) ? 'flat' : 'sharp')
  const idx = noteIndex(note)
  return noteFromIndex(idx + semitones, resolvedStyle)
}

/** Returns the 12 notes in circle-of-fifths order */
export function circleOfFifths(): string[] {
  return ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
}
