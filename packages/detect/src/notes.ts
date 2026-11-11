// Note primitives, self-contained to keep this package zero-dependency.

export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const LETTER_INDEX: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

/**
 * Chroma (0–11) of a note name, or null when the string is not a note.
 * The letter is case-insensitive and may be followed by sharps (# ♯) or flats (b ♭),
 * so enharmonic spellings such as Cb or E# resolve to the pitch they sound.
 * The result is not wrapped: Cb is -1 and B# is 12, so callers that need an
 * octave can tell them apart from B and C.
 */
export function parseNoteOffset(note: string): number | null {
  const match = /^([A-Ga-g])([#♯b♭]*)$/.exec(note.trim())
  if (!match) return null
  let index = LETTER_INDEX[match[1].toUpperCase()]
  for (const accidental of match[2]) {
    index += accidental === '#' || accidental === '♯' ? 1 : -1
  }
  return index
}

/** Chroma (0–11) of a note name, or null when the string is not a note */
export function parseChroma(note: string): number | null {
  const offset = parseNoteOffset(note)
  return offset === null ? null : ((offset % 12) + 12) % 12
}
