import { describe, it, expect } from 'vitest'
import { generateAriaTitle, generateAriaDescription } from '../src/accessibility'
import type { ChordDiagram, InstrumentConfig } from '../src/types'

const guitar: InstrumentConfig = { strings: 6, frets: 5, tuning: ['E','A','D','G','B','E'] }

describe('generateAriaTitle', () => {
  it('includes chord name when provided', () => {
    const chord: ChordDiagram = { name: 'Am', fingers: [] }
    expect(generateAriaTitle(chord)).toBe('Chord diagram: Am')
  })

  it('returns generic title when no name', () => {
    const chord: ChordDiagram = { fingers: [] }
    expect(generateAriaTitle(chord)).toBe('Chord diagram')
  })
})

describe('generateAriaDescription', () => {
  it('includes chord name in description', () => {
    const chord: ChordDiagram = { name: 'C', fingers: [{ string: 2, fret: 1 }] }
    const desc = generateAriaDescription(chord, guitar)
    expect(desc).toContain('C chord')
  })

  it('includes instrument info', () => {
    const chord: ChordDiagram = { fingers: [] }
    const desc = generateAriaDescription(chord, guitar)
    expect(desc).toContain('6-string instrument')
  })

  it('describes fret position when > 1', () => {
    const chord: ChordDiagram = { fingers: [], position: 5 }
    const desc = generateAriaDescription(chord, guitar)
    expect(desc).toContain('starting at fret 5')
  })

  it('describes muted strings', () => {
    const chord: ChordDiagram = { fingers: [], muted: [6] }
    const desc = generateAriaDescription(chord, guitar)
    expect(desc).toContain('muted: string 6')
  })

  it('describes open strings', () => {
    const chord: ChordDiagram = { fingers: [], open: [1, 5] }
    const desc = generateAriaDescription(chord, guitar)
    expect(desc).toContain('open: string 1, string 5')
  })

  it('describes finger positions', () => {
    const chord: ChordDiagram = {
      fingers: [
        { string: 2, fret: 1 },
        { string: 3, fret: 2 },
      ],
    }
    const desc = generateAriaDescription(chord, guitar)
    expect(desc).toContain('string 2 fret 1')
    expect(desc).toContain('string 3 fret 2')
  })

  it('describes barre chords', () => {
    const chord: ChordDiagram = {
      fingers: [],
      barres: [{ fret: 1, fromString: 1, toString: 6 }],
    }
    const desc = generateAriaDescription(chord, guitar)
    expect(desc).toContain('barre on fret 1 from string 1 to 6')
  })
})
