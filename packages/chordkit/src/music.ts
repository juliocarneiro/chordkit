const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

export type NoteStyle = 'sharp' | 'flat'

function noteIndex(note: string): number {
  const upper = note.trim()
  let idx = NOTES_SHARP.indexOf(upper)
  if (idx === -1) idx = NOTES_FLAT.indexOf(upper)
  if (idx === -1) {
    const base = upper.charAt(0).toUpperCase()
    idx = NOTES_SHARP.findIndex((n) => n.charAt(0) === base)
  }
  return idx === -1 ? 0 : idx
}

/** Given an open string note and a fret number, return the sounding note name */
export function noteAtFret(openNote: string, fret: number, style: NoteStyle = 'sharp'): string {
  const base = noteIndex(openNote)
  const idx = (base + fret) % 12
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
