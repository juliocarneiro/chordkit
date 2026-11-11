import { describe, it, expect } from 'vitest'
import type { ChordDiagram } from 'chordkit'
import { getScale, getDiatonicChords, transposeNote, semitonesBetween, transpose } from '../src/index'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const GUITAR = ['E', 'A', 'D', 'G', 'B', 'E']

const C: ChordDiagram = {
  name: 'C',
  fingers: [{ string: 2, fret: 1 }, { string: 4, fret: 2 }, { string: 5, fret: 3 }],
  open: [1, 3],
  muted: [6],
}
const E: ChordDiagram = {
  name: 'E',
  fingers: [{ string: 3, fret: 1 }, { string: 4, fret: 2 }, { string: 5, fret: 2 }],
  open: [1, 2, 6],
}
const F: ChordDiagram = {
  name: 'F',
  fingers: [{ string: 3, fret: 2 }, { string: 4, fret: 3 }, { string: 5, fret: 3 }],
  barres: [{ fret: 1, fromString: 1, toString: 6 }],
}
const BM7: ChordDiagram = {
  name: 'Bm',
  fingers: [{ string: 2, fret: 2 }, { string: 3, fret: 3 }, { string: 4, fret: 3 }],
  barres: [{ fret: 1, fromString: 1, toString: 5 }],
  muted: [6],
  position: 7,
}

/** Pitch classes sounding on each non-muted string, as a sorted set */
function sounding(chord: ChordDiagram): number[] {
  const offset = (chord.position ?? 1) - 1
  const out = new Set<number>()
  for (let s = 1; s <= 6; s++) {
    if (chord.muted?.includes(s)) continue
    let fret = 0
    if (!chord.open?.includes(s)) {
      const frets = [
        ...chord.fingers.filter((f) => f.string === s).map((f) => f.fret),
        ...(chord.barres ?? [])
          .filter((b) => s >= Math.min(b.fromString, b.toString) && s <= Math.max(b.fromString, b.toString))
          .map((b) => b.fret),
      ]
      if (frets.length === 0) throw new Error(`string ${s} has no state`)
      fret = Math.max(...frets) + offset
    }
    out.add((NOTES.indexOf(GUITAR[6 - s]) + fret) % 12)
  }
  return [...out].sort((a, b) => a - b)
}

const shifted = (pcs: number[], n: number) => pcs.map((p) => (((p + n) % 12) + 12) % 12).sort((a, b) => a - b)

describe('transpose keeps the chord musically correct', () => {
  const chords = { C, E, F, BM7 }
  const steps = [-12, -7, -5, -2, -1, 1, 2, 3, 5, 7, 11, 12, 14]

  for (const [label, chord] of Object.entries(chords)) {
    it.each(steps)(`${label} by %i semitones sounds the transposed notes`, (n) => {
      expect(sounding(transpose(chord, n))).toEqual(shifted(sounding(chord), n))
    })

    it.each(steps)(`${label} by %i semitones stays inside a 5-fret diagram`, (n) => {
      const result = transpose(chord, n)
      const frets = [...result.fingers.map((f) => f.fret), ...(result.barres ?? []).map((b) => b.fret)]
      for (const fret of frets) {
        expect(fret).toBeGreaterThanOrEqual(1)
        expect(fret).toBeLessThanOrEqual(5)
      }
      expect(result.position ?? 1).toBeGreaterThanOrEqual(1)
    })
  }

  it('turns open strings into a barre when moving up', () => {
    const result = transpose(E, 1)
    expect(result.name).toBe('F')
    expect(result.open ?? []).toEqual([])
    expect(result.barres).toEqual([{ fret: 1, fromString: 1, toString: 6 }])
  })

  it('turns a barre on the nut back into open strings', () => {
    const result = transpose(F, -1)
    expect(result.name).toBe('E')
    expect(result.barres ?? []).toEqual([])
    expect([...(result.open ?? [])].sort()).toEqual([1, 2, 6])
    expect(result.position ?? 1).toBe(1)
  })

  it('never produces fret 12 for a one-semitone drop', () => {
    const result = transpose(C, -1)
    expect(result.name).toBe('B')
    expect(result.fingers.every((f) => f.fret <= 5)).toBe(true)
  })

  it('does not mutate the source chord', () => {
    const before = JSON.stringify(E)
    transpose(E, 3)
    expect(JSON.stringify(E)).toBe(before)
  })
})

describe('transpose renames the chord', () => {
  it('transposes the bass of a slash chord', () => {
    expect(transpose({ name: 'C/G', fingers: [] }, 2).name).toBe('D/A')
  })

  it('does not switch to flats because of a b5 in the suffix', () => {
    expect(transpose({ name: 'Cm7b5', fingers: [] }, 1).name).toBe('C#m7b5')
  })

  it('keeps flats for a flat root', () => {
    expect(transpose({ name: 'Bbm', fingers: [] }, 2).name).toBe('Cm')
    expect(transpose({ name: 'Bb', fingers: [] }, 1).name).toBe('B')
    expect(transpose({ name: 'Eb', fingers: [] }, 3).name).toBe('Gb')
  })
})

describe('scales spell flat keys with flats', () => {
  it('F major has Bb', () => {
    expect(getScale('F', 'major')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E'])
  })

  it('D minor has Bb', () => {
    expect(getScale('D', 'minor')).toEqual(['D', 'E', 'F', 'G', 'A', 'Bb', 'C'])
  })

  it('G dorian has Bb', () => {
    expect(getScale('G', 'dorian')).toContain('Bb')
  })

  it('G major still has F#', () => {
    expect(getScale('G', 'major')).toContain('F#')
  })

  it('an explicit style still wins', () => {
    expect(getScale('F', 'major', 'sharp')).toContain('A#')
  })

  it('diatonic chords of D minor use Bb', () => {
    expect(getDiatonicChords('D', 'minor').map((c) => c.name)).toEqual(['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'])
  })
})

describe('note parsing', () => {
  it('understands enharmonic spellings', () => {
    expect(transposeNote('Cb', 0)).toBe('B')
    expect(transposeNote('E#', 0)).toBe('F')
    expect(semitonesBetween('B#', 'C')).toBe(0)
  })

  it('is case-insensitive on the note letter', () => {
    expect(transposeNote('eb', 0)).toBe('Eb')
    expect(transposeNote('bb', 2)).toBe('C')
  })

  it('throws on something that is not a note instead of answering C', () => {
    expect(() => transposeNote('H', 0)).toThrow(/H/)
    expect(() => getScale('', 'major')).toThrow()
  })
})
