export interface ParsedChord {
  /** Original raw string, e.g. "Am7" */
  raw: string
  /** Root note, e.g. "A" */
  root: string
  /** Chord quality, e.g. "minor" */
  quality: ChordQuality
  /** Extension labels, e.g. ["7", "9"] */
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
  { pattern: /^(min|minor|m(?![a-z]))/,      quality: 'minor' },
  // maj must NOT consume when immediately followed by a digit (e.g. maj7, maj9)
  { pattern: /^(maj(?!\d)|major(?!\d)|M(?![a-z]))/, quality: 'major' },
  { pattern: /^(dim|°)/,                     quality: 'diminished' },
  { pattern: /^(aug|\+)/,                    quality: 'augmented' },
  { pattern: /^sus2/,                        quality: 'suspended2' },
  { pattern: /^sus4?/,                       quality: 'suspended4' },
  { pattern: /^5/,                           quality: 'power' },
]

const EXTENSION_TOKENS = /^(maj7|maj9|maj11|maj13|11|13|add9|add11|add13|[679])/

/**
 * Parses a chord name string into its components.
 * Returns null if the string is not a recognizable chord name.
 *
 * @example
 * parseChordName('Am7')    // { root: 'A', quality: 'minor', extensions: ['7'], bass: undefined }
 * parseChordName('C#maj7') // { root: 'C#', quality: 'major', extensions: ['maj7'] }
 * parseChordName('G/B')    // { root: 'G', quality: 'major', extensions: [], bass: 'B' }
 */
export function parseChordName(name: string): ParsedChord | null {
  const trimmed = name.trim()
  if (!trimmed) return null

  const rootMatch = trimmed.match(ROOT_PATTERN)
  if (!rootMatch) return null

  const root = rootMatch[1]
  let rest = trimmed.slice(root.length)

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

  // A lone "7" on a major chord implies dominant
  const extensions: string[] = []
  let extRest = rest
  while (extRest.length > 0) {
    const match = extRest.match(EXTENSION_TOKENS)
    if (!match) break
    extensions.push(match[1])
    extRest = extRest.slice(match[0].length)
  }

  if (extensions.includes('7') && quality === 'major') {
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
