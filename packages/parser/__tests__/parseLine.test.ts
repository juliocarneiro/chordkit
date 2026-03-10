import { describe, it, expect } from 'vitest'
import { parseLine } from '../src/parseLine'

describe('parseLine', () => {
  it('extracts chord names from a space-separated line', () => {
    expect(parseLine('Am  F  C  G')).toEqual(['Am', 'F', 'C', 'G'])
  })

  it('ignores non-chord tokens', () => {
    expect(parseLine('Intro: Am F C G')).toEqual(['Am', 'F', 'C', 'G'])
  })

  it('handles a single chord', () => {
    expect(parseLine('Dm7')).toEqual(['Dm7'])
  })

  it('handles chords with extensions', () => {
    expect(parseLine('Dm7  G7  Cmaj7')).toEqual(['Dm7', 'G7', 'Cmaj7'])
  })

  it('returns an empty array for a line with no chords', () => {
    expect(parseLine('no chords here at all')).toEqual([])
    expect(parseLine('')).toEqual([])
  })

  it('handles extra whitespace', () => {
    expect(parseLine('  Am    F    C  ')).toEqual(['Am', 'F', 'C'])
  })

  it('handles chords with sharp and flat roots', () => {
    expect(parseLine('C# Bb F#m')).toEqual(['C#', 'Bb', 'F#m'])
  })
})
