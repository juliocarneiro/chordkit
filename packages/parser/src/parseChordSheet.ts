import { parseChordName } from './parseChordName'
import type { ParsedChord } from './parseChordName'

/** A segment of a chord sheet — either plain text or a chord marker */
export interface ChordSheetSegment {
  /** The text portion of the segment (may be empty string for standalone chord markers) */
  text: string
  /** Parsed chord, present when this segment starts with a chord marker */
  chord?: ParsedChord
}

/** A single line of a chord sheet, with its segments */
export interface ChordSheetLine {
  segments: ChordSheetSegment[]
}

/**
 * Parses a chord sheet where chords are wrapped in square brackets.
 *
 * Each chord marker `[Am]` is attached to the text that follows it until
 * the next chord marker or end of the string.
 *
 * @example
 * parseChordSheet('[Am]Yesterday [F]all my [C]troubles')
 * // [
 * //   { chord: { root: 'A', quality: 'minor', ... }, text: 'Yesterday ' },
 * //   { chord: { root: 'F', quality: 'major', ... }, text: 'all my ' },
 * //   { chord: { root: 'C', quality: 'major', ... }, text: 'troubles' },
 * // ]
 *
 * @example
 * parseChordSheet('Some intro text\n[Am]Yesterday [F]all my\n[C]troubles [G]seemed so far away')
 * // Returns per-line structure
 */
export function parseChordSheet(text: string): ChordSheetLine[] {
  const lines = text.split(/\r?\n/)
  return lines.map((line) => ({ segments: parseLineSegments(line) }))
}

function parseLineSegments(line: string): ChordSheetSegment[] {
  const chordPattern = /\[([^\]]+)\]/g
  const segments: ChordSheetSegment[] = []

  // Collect all matches first to avoid mutating lastIndex mid-loop
  const matches: Array<{ chordName: string; start: number; end: number }> = []
  let m: RegExpExecArray | null
  while ((m = chordPattern.exec(line)) !== null) {
    matches.push({ chordName: m[1], start: m.index, end: chordPattern.lastIndex })
  }

  if (matches.length === 0) {
    return [{ text: line }]
  }

  // Text before the first chord marker
  if (matches[0].start > 0) {
    segments.push({ text: line.slice(0, matches[0].start) })
  }

  for (let i = 0; i < matches.length; i++) {
    const { chordName, end } = matches[i]
    const textEnd = i + 1 < matches.length ? matches[i + 1].start : line.length

    const parsed = parseChordName(chordName)
    segments.push({
      chord: parsed ?? undefined,
      text: line.slice(end, textEnd),
    })
  }

  return segments
}
