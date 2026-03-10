import { describe, it, expect } from 'vitest'
import { getScale, getScaleTypes } from '../src/scales'

describe('getScale', () => {
  it('returns the C major scale', () => {
    expect(getScale('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('returns the A minor scale', () => {
    expect(getScale('A', 'minor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('returns the G major scale', () => {
    expect(getScale('G', 'major')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#'])
  })

  it('returns the Bb major scale with flat notation', () => {
    expect(getScale('Bb', 'major')).toEqual(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'])
  })

  it('returns the E pentatonic minor scale', () => {
    expect(getScale('E', 'pentatonicMinor')).toEqual(['E', 'G', 'A', 'B', 'D'])
  })

  it('returns the A pentatonic major scale', () => {
    expect(getScale('A', 'pentatonicMajor')).toEqual(['A', 'B', 'C#', 'E', 'F#'])
  })

  it('returns a blues scale with 6 notes', () => {
    expect(getScale('A', 'blues')).toHaveLength(6)
    expect(getScale('A', 'blues')[0]).toBe('A')
  })

  it('returns the D dorian scale', () => {
    expect(getScale('D', 'dorian')).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C'])
  })

  it('respects explicit style override', () => {
    const sharp = getScale('F#', 'major', 'sharp')
    const flat  = getScale('F#', 'major', 'flat')
    expect(sharp[1]).toBe('G#')
    expect(flat[1]).toBe('Ab')
  })

  it('major scale always has 7 notes', () => {
    for (const root of ['C', 'D', 'E', 'F', 'G', 'A', 'B']) {
      expect(getScale(root, 'major')).toHaveLength(7)
    }
  })
})

describe('getScaleTypes', () => {
  it('returns an array of scale type strings', () => {
    const types = getScaleTypes()
    expect(types).toContain('major')
    expect(types).toContain('minor')
    expect(types).toContain('blues')
    expect(types).toContain('dorian')
  })

  it('returns at least 12 scale types', () => {
    expect(getScaleTypes().length).toBeGreaterThanOrEqual(12)
  })
})
