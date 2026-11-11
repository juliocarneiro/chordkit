import { describe, it, expect } from 'vitest'
import { detectChord, noteToMidi } from '../src/index'

describe('detectChord input handling', () => {
  it('ignores empty or unrecognisable notes instead of throwing', () => {
    expect(detectChord([''])).toEqual([])
    expect(detectChord(['C', '', 'E', 'H', 'G'])[0].name).toBe('C')
  })

  it('understands enharmonic spellings', () => {
    expect(detectChord(['Cb', 'Eb', 'Gb'])[0].name).toBe('B')
    expect(detectChord(['E#', 'A', 'C'])[0].name).toBe('F')
  })

  it('is case-insensitive on the note letter', () => {
    expect(detectChord(['e', 'g', 'b'])[0].name).toBe('Em')
    expect(detectChord(['bb', 'd', 'f'], { style: 'flat' })[0].name).toBe('Bb')
  })
})

describe('detectChord ranking', () => {
  it('prefers the chord rooted on the bass note when scores tie', () => {
    expect(detectChord(['C', 'D', 'G'])[0].name).toBe('Csus2')
    expect(detectChord(['G', 'C', 'D'])[0].name).toBe('Gsus4')
  })

  it('prefers Am7 over C6-like readings with A in the bass and C with C in the bass', () => {
    expect(detectChord(['A', 'C', 'E', 'G'])[0].name).toBe('Am7')
  })
})

describe('noteToMidi', () => {
  it('is case-insensitive and understands enharmonics', () => {
    expect(noteToMidi('c', 4)).toBe(60)
    expect(noteToMidi('bb', 3)).toBe(58)
    expect(noteToMidi('E#', 4)).toBe(65)
  })

  it('still returns -1 for something that is not a note', () => {
    expect(noteToMidi('H', 4)).toBe(-1)
  })
})
