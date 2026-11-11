export interface ParsedChord {
  /** Original raw string, e.g. "Am7" */
  raw: string
  /** Root note, e.g. "A" */
  root: string
  /** Chord quality, e.g. "minor" */
  quality: ChordQuality
  /**
   * Everything after the quality, in order: extensions ("7", "maj7", "add9", "6/9"),
   * alterations ("b5", "#9") and late suspensions ("sus4" in "C7sus4").
   */
  extensions: string[]
  /** Bass note for slash chords, e.g. "G" in "Am7/G" */
  bass?: string
}

export type ChordQuality =
  | 'major'
  | 'minor'
  | 'dominant'
  | 'diminished'
  | 'augmented'
  | 'suspended2'
  | 'suspended4'
  | 'power'

const ROOT_PATTERN = /^([A-G][#b]?)/
const BASS_PATTERN = /\/([A-G][#b]?)$/

const QUALITY_TOKENS: Array<{ pattern: RegExp; quality: ChordQuality }> = [
  // "m" is minor unless it starts "maj"/"major" (Cmaj7); "Cmmaj7" is minor + maj7
  { pattern: /^(minor|min|m(?!aj))/, quality: 'minor' },
  // maj / M must NOT consume when followed by a digit: maj7, maj9 and M7 are extensions
  { pattern: /^(major(?!\d)|maj(?!\d)|M(?![a-z\d]))/, quality: 'major' },
  { pattern: /^(dim|°)/, quality: 'diminished' },
  { pattern: /^(aug|\+)/, quality: 'augmented' },
  { pattern: /^sus2/, quality: 'suspended2' },
  { pattern: /^sus4?/, quality: 'suspended4' },
  { pattern: /^5/, quality: 'power' },
]

// Longer alternatives first, so "6/9" is not read as "6" and "13" not as a stray digit.
const EXTENSION_TOKENS =
  /^(maj7|maj9|maj11|maj13|M7|M9|M11|M13|6\/9|11|13|add9|add11|add13|sus2|sus4|sus|b5|#5|b9|#9|#11|b13|[679])/

/** Extensions that turn a plain major triad into a dominant chord */
const DOMINANT_EXTENSIONS = new Set(['7', '9', '11', '13'])

/**
 * Parses a chord name string into its components.
 * Returns null if the string is not a recognizable chord name — including words
 * that merely start with a note letter, such as "Bridge" or "Capo".
 *
 * @example
 * parseChordName('Am7')    // { root: 'A', quality: 'minor', extensions: ['7'], bass: undefined }
 * parseChordName('C#maj7') // { root: 'C#', quality: 'major', extensions: ['maj7'] }
 * parseChordName('G/B')    // { root: 'G', quality: 'major', extensions: [], bass: 'B' }
 * parseChordName('Cm7b5')  // { root: 'C', quality: 'minor', extensions: ['7', 'b5'] }
 */
export function parseChordName(name: string): ParsedChord | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const rootMatch = trimmed.match(ROOT_PATTERN)
  if (!rootMatch) return null

  const root = rootMatch[1]
  // Parentheses only group alterations: C7(#9) is C7#9
  let rest = trimmed.slice(root.length).replace(/[()]/g, '')

  let bass: string | undefined
  const bassMatch = rest.match(BASS_PATTERN)
  if (bassMatch) {
    bass = bassMatch[1]
    rest = rest.slice(0, rest.length - bassMatch[0].length)
  }

  let quality: ChordQuality = 'major'
  for (const { pattern, quality: q } of QUALITY_TOKENS) {
    const match = rest.match(pattern)
    if (match) {
      quality = q
      rest = rest.slice(match[0].length)
      break
    }
  }

  const extensions: string[] = []
  while (rest.length > 0) {
    const match = rest.match(EXTENSION_TOKENS)
    if (!match) break
    // "M7" is shorthand for "maj7"
    extensions.push(match[1].replace(/^M(?=\d)/, 'maj'))
    rest = rest.slice(match[0].length)
  }

  // Anything left over means this was not a chord name after all.
  if (rest.length > 0) return null

  // A 7, 9, 11 or 13 on a plain major chord implies dominant
  if (quality === 'major' && extensions.some((e) => DOMINANT_EXTENSIONS.has(e))) {
    quality = 'dominant'
  }

  return { raw: trimmed, root, quality, extensions, bass }
}

/**
 * Reconstructs a chord name string from a ParsedChord.
 */
export function formatChordName(parsed: ParsedChord): string {
  const qualityStr =
    parsed.quality === 'minor' ? 'm' :
    parsed.quality === 'diminished' ? 'dim' :
    parsed.quality === 'augmented' ? 'aug' :
    parsed.quality === 'suspended2' ? 'sus2' :
    parsed.quality === 'suspended4' ? 'sus4' :
    parsed.quality === 'power' ? '5' :
    ''

  const extensions = parsed.extensions.join('')
  const bass = parsed.bass ? `/${parsed.bass}` : ''
  return `${parsed.root}${qualityStr}${extensions}${bass}`
}

/**
 * Returns true if the string is a recognizable chord name.
 */
export function isValidChordName(name: string): boolean {
  return parseChordName(name) !== null
}
