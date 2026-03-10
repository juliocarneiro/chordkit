import { describe, it, expect } from 'vitest'
import { getDiatonicChords, identifyChord } from '../src/chords'

describe('getDiatonicChords', () => {
  it('returns 7 chords', () => {
    expect(getDiatonicChords('C', 'major')).toHaveLength(7)
    expect(getDiatonicChords('A', 'minor')).toHaveLength(7)
  })

  it('returns correct degrees for C major', () => {
    const chords = getDiatonicChords('C', 'major')
    expect(chords[0]).toMatchObject({ degree: 'I',   name: 'C',    quality: 'major'      })
    expect(chords[1]).toMatchObject({ degree: 'II',  name: 'Dm',   quality: 'minor'      })
    expect(chords[2]).toMatchObject({ degree: 'III', name: 'Em',   quality: 'minor'      })
    expect(chords[3]).toMatchObject({ degree: 'IV',  name: 'F',    quality: 'major'      })
    expect(chords[4]).toMatchObject({ degree: 'V',   name: 'G',    quality: 'major'      })
    expect(chords[5]).toMatchObject({ degree: 'VI',  name: 'Am',   quality: 'minor'      })
    expect(chords[6]).toMatchObject({ degree: 'VII', name: 'Bdim', quality: 'diminished' })
  })

  it('returns correct degrees for G major', () => {
    const chords = getDiatonicChords('G', 'major')
    expect(chords[0].name).toBe('G')
    expect(chords[1].name).toBe('Am')
    expect(chords[6].name).toBe('F#dim')
  })

  it('returns correct degrees for A minor', () => {
    const chords = getDiatonicChords('A', 'minor')
    expect(chords[0]).toMatchObject({ degree: 'I',  name: 'Am', quality: 'minor' })
    expect(chords[4]).toMatchObject({ degree: 'V',  name: 'Em', quality: 'minor' })
    expect(chords[6]).toMatchObject({ degree: 'VII',name: 'G',  quality: 'major' })
  })

  it('uses flat notation when root uses flats', () => {
    const chords = getDiatonicChords('Bb', 'major')
    expect(chords[0].name).toBe('Bb')
    expect(chords[3].name).toBe('Eb')
  })
})

describe('identifyChord', () => {
  it('identifies a major triad', () => {
    expect(identifyChord(['C', 'E', 'G'])).toBe('C')
    expect(identifyChord(['G', 'B', 'D'])).toBe('G')
  })

  it('identifies a minor triad', () => {
    expect(identifyChord(['A', 'C', 'E'])).toBe('Am')
    expect(identifyChord(['D', 'F', 'A'])).toBe('Dm')
  })

  it('identifies a diminished triad', () => {
    expect(identifyChord(['B', 'D', 'F'])).toBe('Bdim')
  })

  it('identifies a dominant 7th chord', () => {
    expect(identifyChord(['G', 'B', 'D', 'F'])).toBe('G7')
  })

  it('is order-independent', () => {
    expect(identifyChord(['E', 'C', 'G'])).toBe(identifyChord(['C', 'E', 'G']))
  })

  it('returns null for a single note', () => {
    expect(identifyChord(['C'])).toBeNull()
  })

  it('returns null for an unrecognizable combination', () => {
    expect(identifyChord(['C', 'D'])).toBeNull()
  })

  it('respects style preference for root name', () => {
    const sharpResult = identifyChord(['C#', 'F', 'G#'], 'sharp')
    const flatResult  = identifyChord(['Db', 'F', 'Ab'], 'flat')
    expect(sharpResult).toBe('C#')
    expect(flatResult).toBe('Db')
  })
})
