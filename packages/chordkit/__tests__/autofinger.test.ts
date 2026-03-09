import { describe, it, expect } from 'vitest'
import { autoFinger } from '../src/autofinger'
import type { ChordDiagram } from '../src/types'

describe('autoFinger', () => {
  it('assigns fingers in fret order', () => {
    const chord: ChordDiagram = {
      name: 'Am',
      fingers: [
        { string: 2, fret: 1 },
        { string: 3, fret: 2 },
        { string: 4, fret: 2 },
      ],
    }
    const result = autoFinger(chord)
    expect(result.fingers[0].text).toBe('2')
    expect(result.fingers[1].text).toBe('3')
    expect(result.fingers[2].text).toBe('4')
  })

  it('assigns finger 1 to barre fret', () => {
    const chord: ChordDiagram = {
      name: 'F',
      fingers: [
        { string: 3, fret: 2 },
        { string: 5, fret: 3 },
        { string: 4, fret: 3 },
      ],
      barres: [{ fret: 1, fromString: 1, toString: 6 }],
    }
    const result = autoFinger(chord)
    expect(result.barres![0].text).toBe('1')
    const fingerTexts = result.fingers.map((f) => f.text)
    expect(fingerTexts).toContain('2')
    expect(fingerTexts).toContain('3')
    expect(fingerTexts).toContain('4')
  })

  it('does not overwrite explicit finger text', () => {
    const chord: ChordDiagram = {
      fingers: [
        { string: 2, fret: 1, text: 'T' },
        { string: 3, fret: 2 },
      ],
    }
    const result = autoFinger(chord)
    const thumb = result.fingers.find((f) => f.string === 2)
    expect(thumb?.text).toBe('T')
  })

  it('handles single finger chord', () => {
    const chord: ChordDiagram = {
      fingers: [{ string: 1, fret: 3 }],
    }
    const result = autoFinger(chord)
    expect(result.fingers[0].text).toBe('2')
  })

  it('returns a new object without mutating the original', () => {
    const chord: ChordDiagram = {
      fingers: [{ string: 2, fret: 1 }],
    }
    const result = autoFinger(chord)
    expect(result).not.toBe(chord)
    expect(chord.fingers[0].text).toBeUndefined()
  })
})
