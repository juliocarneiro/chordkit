import { describe, it, expect } from 'vitest'
import { noteAtFret, noteForFinger } from '../src/music'

describe('noteAtFret', () => {
  it('returns the same note at fret 0', () => {
    expect(noteAtFret('E', 0)).toBe('E')
    expect(noteAtFret('A', 0)).toBe('A')
  })

  it('calculates notes with sharps', () => {
    expect(noteAtFret('E', 1, 'sharp')).toBe('F')
    expect(noteAtFret('E', 2, 'sharp')).toBe('F#')
    expect(noteAtFret('E', 3, 'sharp')).toBe('G')
    expect(noteAtFret('A', 2, 'sharp')).toBe('B')
  })

  it('calculates notes with flats', () => {
    expect(noteAtFret('E', 1, 'flat')).toBe('F')
    expect(noteAtFret('E', 2, 'flat')).toBe('Gb')
    expect(noteAtFret('A', 2, 'flat')).toBe('B')
    expect(noteAtFret('B', 1, 'flat')).toBe('C')
  })

  it('wraps around after 12 frets', () => {
    expect(noteAtFret('E', 12)).toBe('E')
    expect(noteAtFret('A', 12)).toBe('A')
    expect(noteAtFret('C', 12)).toBe('C')
  })

  it('handles accidentals in input', () => {
    expect(noteAtFret('F#', 1, 'sharp')).toBe('G')
    expect(noteAtFret('Bb', 2, 'flat')).toBe('C')
  })
})

describe('noteForFinger', () => {
  const guitarTuning = ['E', 'A', 'D', 'G', 'B', 'E']

  it('returns correct note for guitar string 1 (high E) fret 1', () => {
    expect(noteForFinger(guitarTuning, 6, 1, 1, 1)).toBe('F')
  })

  it('returns correct note for guitar string 2 (B) fret 1', () => {
    expect(noteForFinger(guitarTuning, 6, 2, 1, 1)).toBe('C')
  })

  it('accounts for position offset', () => {
    expect(noteForFinger(guitarTuning, 6, 1, 1, 5)).toBe('A')
  })

  it('works with flat notation', () => {
    expect(noteForFinger(guitarTuning, 6, 1, 2, 1, 'flat')).toBe('Gb')
  })

  it('works with ukulele tuning', () => {
    const ukeTuning = ['G', 'C', 'E', 'A']
    expect(noteForFinger(ukeTuning, 4, 1, 3, 1)).toBe('C')
  })
})
