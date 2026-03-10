import { describe, it, expect } from 'vitest'
import { transpose } from '../src/transpose'
import type { ChordDiagram } from 'chordkit'

const AM: ChordDiagram = {
  name: 'Am',
  fingers: [
    { string: 2, fret: 1 },
    { string: 3, fret: 2 },
    { string: 4, fret: 2 },
  ],
  muted: [6],
  open: [1, 5],
}

const EM: ChordDiagram = {
  name: 'Em',
  fingers: [
    { string: 4, fret: 2 },
    { string: 5, fret: 2 },
  ],
  open: [1, 2, 3, 6],
}

describe('transpose', () => {
  it('returns the same chord when semitones is 0', () => {
    const result = transpose(AM, 0)
    expect(result).toBe(AM)
  })

  it('updates the chord name when transposing', () => {
    expect(transpose(AM, 2).name).toBe('Bm')
    expect(transpose(AM, 3).name).toBe('Cm')
    expect(transpose(AM, -2).name).toBe('Gm')
  })

  it('returns a new object without mutating the original', () => {
    const result = transpose(AM, 2)
    expect(result).not.toBe(AM)
    expect(AM.name).toBe('Am')
  })

  it('preserves open and muted arrays', () => {
    const result = transpose(AM, 2)
    expect(result.muted).toEqual(AM.muted)
    expect(result.open).toEqual(AM.open)
  })

  it('transposes a chord by one semitone up', () => {
    const result = transpose(EM, 1, 'guitar')
    expect(result.name).toBe('Fm')
  })

  it('transposes correctly with flat notation', () => {
    expect(transpose(AM, 1, 'guitar', 'flat').name).toBe('Bbm')
  })

  it('produces valid finger fret numbers (non-negative)', () => {
    const result = transpose(AM, 5, 'guitar')
    for (const finger of result.fingers) {
      expect(finger.fret).toBeGreaterThanOrEqual(0)
    }
  })

  it('sets position to 1 after transposition', () => {
    const chord: ChordDiagram = { name: 'Am', fingers: [{ string: 2, fret: 1 }], position: 5 }
    const result = transpose(chord, 2, 'guitar')
    expect(result.position).toBe(1)
  })
})
