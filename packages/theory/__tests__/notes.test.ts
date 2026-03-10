import { describe, it, expect } from 'vitest'
import {
  enharmonic,
  semitonesBetween,
  transposeNote,
  circleOfFifths,
} from '../src/notes'

describe('enharmonic', () => {
  it('returns the flat equivalent of a sharp note', () => {
    expect(enharmonic('C#')).toBe('Db')
    expect(enharmonic('F#')).toBe('Gb')
    expect(enharmonic('A#')).toBe('Bb')
  })

  it('returns the sharp equivalent of a flat note', () => {
    expect(enharmonic('Db')).toBe('C#')
    expect(enharmonic('Gb')).toBe('F#')
    expect(enharmonic('Bb')).toBe('A#')
  })

  it('returns natural notes unchanged', () => {
    expect(enharmonic('C')).toBe('C')
    expect(enharmonic('E')).toBe('E')
    expect(enharmonic('G')).toBe('G')
  })
})

describe('semitonesBetween', () => {
  it('returns 0 for the same note', () => {
    expect(semitonesBetween('C', 'C')).toBe(0)
    expect(semitonesBetween('A', 'A')).toBe(0)
  })

  it('calculates ascending semitone distance', () => {
    expect(semitonesBetween('C', 'G')).toBe(7)
    expect(semitonesBetween('A', 'C')).toBe(3)
    expect(semitonesBetween('E', 'A')).toBe(5)
  })

  it('always returns a value between 0 and 11', () => {
    expect(semitonesBetween('G', 'C')).toBe(5)
    expect(semitonesBetween('B', 'C')).toBe(1)
  })

  it('handles enharmonic equivalents', () => {
    expect(semitonesBetween('C', 'Db')).toBe(semitonesBetween('C', 'C#'))
  })
})

describe('transposeNote', () => {
  it('transposes up by semitones', () => {
    expect(transposeNote('E', 5)).toBe('A')
    expect(transposeNote('C', 7)).toBe('G')
    expect(transposeNote('A', 3)).toBe('C')
  })

  it('transposes down by negative semitones', () => {
    expect(transposeNote('A', -2)).toBe('G')
    expect(transposeNote('C', -1)).toBe('B')
  })

  it('wraps around correctly', () => {
    expect(transposeNote('B', 1)).toBe('C')
    expect(transposeNote('C', 12)).toBe('C')
  })

  it('respects style preference', () => {
    expect(transposeNote('C', 1, 'sharp')).toBe('C#')
    expect(transposeNote('C', 1, 'flat')).toBe('Db')
  })

  it('infers flat style from flat input note', () => {
    expect(transposeNote('Bb', 2)).toBe('C')
  })
})

describe('circleOfFifths', () => {
  it('returns 12 notes', () => {
    expect(circleOfFifths()).toHaveLength(12)
  })

  it('starts with C', () => {
    expect(circleOfFifths()[0]).toBe('C')
  })

  it('each step is a perfect fifth (7 semitones) up', () => {
    const circle = circleOfFifths()
    for (let i = 0; i < circle.length - 1; i++) {
      const interval = semitonesBetween(circle[i], circle[i + 1])
      expect(interval).toBe(7)
    }
  })
})
