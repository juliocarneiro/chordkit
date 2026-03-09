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
  return lines.map((line) => ({ segments: parseLine(line) }))
}

function parseLine(line: string): ChordSheetSegment[] {
  const segments: ChordSheetSegment[] = []
  const chordPattern = /\[([^\]]+)\]/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = chordPattern.exec(line)) !== null) {
    const chordName = match[1]
    const chordStart = match.index
    const chordEnd = chordPattern.lastIndex

    if (chordStart > lastIndex) {
      segments.push({ text: line.slice(lastIndex, chordStart) })
    }

    const nextMatch = chordPattern.exec(line)
    const textEnd = nextMatch ? nextMatch.index : line.length

    if (nextMatch) {
      chordPattern.lastIndex = nextMatch.index
    }

    const parsed = parseChordName(chordName)
    segments.push({
      chord: parsed ?? undefined,
      text: line.slice(chordEnd, textEnd),
    })

    lastIndex = textEnd
  }

  if (lastIndex < line.length) {
    segments.push({ text: line.slice(lastIndex) })
  }

  if (segments.length === 0) {
    segments.push({ text: line })
  }

  return segments
}
