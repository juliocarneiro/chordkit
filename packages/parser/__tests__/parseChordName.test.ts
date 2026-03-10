import { describe, it, expect } from 'vitest'
import { parseChordName, formatChordName, isValidChordName } from '../src/parseChordName'

describe('parseChordName', () => {
  it('parses a simple major chord', () => {
    const result = parseChordName('C')
    expect(result).toMatchObject({ root: 'C', quality: 'major', extensions: [] })
  })

  it('parses a minor chord', () => {
    expect(parseChordName('Am')).toMatchObject({ root: 'A', quality: 'minor', extensions: [] })
    expect(parseChordName('Dm')).toMatchObject({ root: 'D', quality: 'minor' })
    expect(parseChordName('Bm')).toMatchObject({ root: 'B', quality: 'minor' })
  })

  it('parses a chord with sharp root', () => {
    expect(parseChordName('C#')).toMatchObject({ root: 'C#', quality: 'major' })
    expect(parseChordName('F#m')).toMatchObject({ root: 'F#', quality: 'minor' })
  })

  it('parses a chord with flat root', () => {
    expect(parseChordName('Bb')).toMatchObject({ root: 'Bb', quality: 'major' })
    expect(parseChordName('Ebm')).toMatchObject({ root: 'Eb', quality: 'minor' })
  })

  it('parses a dominant 7th chord', () => {
    const result = parseChordName('G7')
    expect(result).toMatchObject({ root: 'G', quality: 'dominant', extensions: ['7'] })
  })

  it('parses a minor 7th chord', () => {
    expect(parseChordName('Am7')).toMatchObject({ root: 'A', quality: 'minor', extensions: ['7'] })
    expect(parseChordName('Dm7')).toMatchObject({ root: 'D', quality: 'minor', extensions: ['7'] })
  })

  it('parses a major 7th chord', () => {
    expect(parseChordName('Cmaj7')).toMatchObject({ root: 'C', quality: 'major', extensions: ['maj7'] })
    expect(parseChordName('C#maj7')).toMatchObject({ root: 'C#', quality: 'major', extensions: ['maj7'] })
  })

  it('parses a diminished chord', () => {
    expect(parseChordName('Bdim')).toMatchObject({ root: 'B', quality: 'diminished' })
  })

  it('parses an augmented chord', () => {
    expect(parseChordName('Caug')).toMatchObject({ root: 'C', quality: 'augmented' })
  })

  it('parses suspended chords', () => {
    expect(parseChordName('Dsus2')).toMatchObject({ root: 'D', quality: 'suspended2' })
    expect(parseChordName('Asus4')).toMatchObject({ root: 'A', quality: 'suspended4' })
    expect(parseChordName('Asus')).toMatchObject({ root: 'A', quality: 'suspended4' })
  })

  it('parses a power chord', () => {
    expect(parseChordName('E5')).toMatchObject({ root: 'E', quality: 'power' })
  })

  it('parses a slash chord (bass note)', () => {
    const result = parseChordName('G/B')
    expect(result).toMatchObject({ root: 'G', quality: 'major', bass: 'B' })
  })

  it('parses a complex slash chord', () => {
    const result = parseChordName('Am7/G')
    expect(result).toMatchObject({ root: 'A', quality: 'minor', extensions: ['7'], bass: 'G' })
  })

  it('preserves the raw string', () => {
    expect(parseChordName('Am7')?.raw).toBe('Am7')
    expect(parseChordName('C#maj7')?.raw).toBe('C#maj7')
  })

  it('returns null for non-chord strings', () => {
    expect(parseChordName('')).toBeNull()
    expect(parseChordName('hello')).toBeNull()
    expect(parseChordName('123')).toBeNull()
  })
})

describe('formatChordName', () => {
  it('reconstructs a simple chord name', () => {
    expect(formatChordName(parseChordName('C')!)).toBe('C')
    expect(formatChordName(parseChordName('Am')!)).toBe('Am')
    expect(formatChordName(parseChordName('Bdim')!)).toBe('Bdim')
  })

  it('reconstructs a chord with extensions', () => {
    expect(formatChordName(parseChordName('Am7')!)).toBe('Am7')
    expect(formatChordName(parseChordName('Dsus2')!)).toBe('Dsus2')
  })

  it('reconstructs a slash chord', () => {
    expect(formatChordName(parseChordName('G/B')!)).toBe('G/B')
  })
})

describe('isValidChordName', () => {
  it('returns true for valid chord names', () => {
    expect(isValidChordName('C')).toBe(true)
    expect(isValidChordName('Am7')).toBe(true)
    expect(isValidChordName('C#maj7')).toBe(true)
    expect(isValidChordName('Bb9')).toBe(true)
    expect(isValidChordName('G/B')).toBe(true)
  })

  it('returns false for invalid strings', () => {
    expect(isValidChordName('')).toBe(false)
    expect(isValidChordName('hello')).toBe(false)
    expect(isValidChordName('123')).toBe(false)
  })
})
