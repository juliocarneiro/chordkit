import { isValidChordName } from './parseChordName'

/**
 * Extracts chord names from a whitespace-separated line of text.
 * Non-chord tokens are ignored.
 *
 * @example
 * parseLine('Am  F  C  G')   // ['Am', 'F', 'C', 'G']
 * parseLine('Intro: Am F C') // ['Am', 'F', 'C']
 */
export function parseLine(line: string): string[] {
  return line
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Za-z0-9#b/+°]/g, ''))
    .filter((token) => token.length > 0 && isValidChordName(token))
}
