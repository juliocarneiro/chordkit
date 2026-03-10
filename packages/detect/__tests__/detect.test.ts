import { describe, it, expect } from 'vitest'
import { detectChord, detectChordFromMidi, detectChordFromFrequencies } from '../src/detect'

describe('detectChord', () => {
  it('detects a C major triad', () => {
    const results = detectChord(['C', 'E', 'G'])
    expect(results[0].name).toBe('C')
    expect(results[0].quality).toBe('major')
    expect(results[0].score).toBe(1)
  })

  it('detects an Am minor triad', () => {
    const results = detectChord(['A', 'C', 'E'])
    expect(results[0].name).toBe('Am')
    expect(results[0].quality).toBe('minor')
    expect(results[0].score).toBe(1)
  })

  it('detects a diminished triad', () => {
    const results = detectChord(['B', 'D', 'F'])
    expect(results[0].name).toBe('Bdim')
    expect(results[0].quality).toBe('diminished')
    expect(results[0].score).toBe(1)
  })

  it('detects a dominant 7th chord', () => {
    const results = detectChord(['G', 'B', 'D', 'F'])
    expect(results[0].name).toBe('G7')
    expect(results[0].quality).toBe('dominant7')
    expect(results[0].score).toBe(1)
  })

  it('detects a major 7th chord', () => {
    const results = detectChord(['C', 'E', 'G', 'B'])
    expect(results[0].name).toBe('Cmaj7')
    expect(results[0].quality).toBe('major7')
    expect(results[0].score).toBe(1)
  })

  it('detects a minor 7th chord', () => {
    const results = detectChord(['A', 'C', 'E', 'G'])
    expect(results[0].name).toBe('Am7')
    expect(results[0].quality).toBe('minor7')
    expect(results[0].score).toBe(1)
  })

  it('detects a first inversion (minor 3rd in bass)', () => {
    // Am first inversion: C (minor 3rd) in bass
    const results = detectChord(['C', 'E', 'A'])
    const am = results.find((r) => r.name === 'Am')
    expect(am).toBeDefined()
    expect(am?.inversion).toBe(1)
  })

  it('detects a second inversion (5th in bass)', () => {
    // Am second inversion: E (5th) in bass
    const results = detectChord(['E', 'A', 'C'])
    const am = results.find((r) => r.name === 'Am')
    expect(am).toBeDefined()
    expect(am?.inversion).toBe(2)
  })

  it('returns candidates sorted by score descending', () => {
    const results = detectChord(['C', 'E', 'G'])
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score)
    }
  })

  it('respects maxCandidates option', () => {
    const results = detectChord(['C', 'E', 'G', 'B'], { maxCandidates: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
  })

  it('respects minScore option', () => {
    const results = detectChord(['C', 'E', 'G'], { minScore: 0.9 })
    expect(results.every((r) => r.score >= 0.9)).toBe(true)
  })

  it('uses flat notation when style is flat', () => {
    const results = detectChord(['Bb', 'D', 'F'], { style: 'flat' })
    expect(results[0].name).toBe('Bb')
    expect(results[0].root).toBe('Bb')
  })

  it('includes matchedNotes in results', () => {
    const results = detectChord(['C', 'E', 'G'])
    expect(results[0].matchedNotes).toContain('C')
    expect(results[0].matchedNotes).toContain('E')
    expect(results[0].matchedNotes).toContain('G')
  })

  it('returns an empty array for an empty input', () => {
    expect(detectChord([])).toEqual([])
  })
})

describe('detectChordFromMidi', () => {
  it('detects Am from MIDI note numbers A3-C4-E4', () => {
    // A3=57, C4=60, E4=64
    const results = detectChordFromMidi([57, 60, 64])
    expect(results[0].name).toBe('Am')
  })

  it('detects C major from MIDI 60-64-67', () => {
    const results = detectChordFromMidi([60, 64, 67])
    expect(results[0].name).toBe('C')
  })

  it('detects G7 from MIDI notes G3-B3-D4-F4', () => {
    // G3=55, B3=59, D4=62, F4=65
    const results = detectChordFromMidi([55, 59, 62, 65])
    expect(results[0].name).toBe('G7')
  })

  it('is order-independent (sorts by pitch internally)', () => {
    const ascending  = detectChordFromMidi([60, 64, 67])
    const descending = detectChordFromMidi([67, 64, 60])
    expect(ascending[0].name).toBe(descending[0].name)
  })
})

describe('detectChordFromFrequencies', () => {
  it('detects Am from approximate frequencies', () => {
    // A3≈220Hz, C4≈261.63Hz, E4≈329.63Hz
    const results = detectChordFromFrequencies([220, 261.63, 329.63])
    expect(results[0].name).toBe('Am')
  })

  it('detects C major from approximate frequencies', () => {
    // C4≈261.63Hz, E4≈329.63Hz, G4≈392Hz
    const results = detectChordFromFrequencies([261.63, 329.63, 392])
    expect(results[0].name).toBe('C')
  })

  it('ignores out-of-range frequencies', () => {
    // Only valid frequencies should contribute
    const results = detectChordFromFrequencies([0, -10, 261.63, 329.63, 392, 99999])
    expect(results[0].name).toBe('C')
  })

  it('returns empty for all out-of-range frequencies', () => {
    expect(detectChordFromFrequencies([0, -1, 99999])).toEqual([])
  })
})
