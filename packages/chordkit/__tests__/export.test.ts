import { describe, it, expect } from 'vitest'
import { toSVGDataURL } from '../src/export'
import { ChordChart } from '../src/ChordChart'

const testSVG = ChordChart.svg({
  instrument: 'guitar',
  chord: {
    name: 'Am',
    fingers: [
      { string: 2, fret: 1 },
      { string: 3, fret: 2 },
      { string: 4, fret: 2 },
    ],
    muted: [6],
    open: [1, 5],
  },
})

describe('toSVGDataURL', () => {
  it('returns a valid data URL', () => {
    const url = toSVGDataURL(testSVG)
    expect(url).toMatch(/^data:image\/svg\+xml;/)
  })

  it('contains base64 or charset encoding', () => {
    const url = toSVGDataURL(testSVG)
    expect(url).toMatch(/base64|charset=utf-8/)
  })

  it('works with any SVG string', () => {
    const simple = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'
    const url = toSVGDataURL(simple)
    expect(url).toContain('data:image/svg+xml')
  })
})

describe('ChordChart.toSVGDataURL (static)', () => {
  it('returns a data URL from chord options', () => {
    const url = ChordChart.toSVGDataURL({
      chord: {
        name: 'G',
        fingers: [{ string: 1, fret: 3 }],
        open: [2, 3, 4],
      },
    })
    expect(url).toContain('data:image/svg+xml')
  })
})

describe('toSVGDataURL encoding', () => {
  it('correctly encodes special characters', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>C#m7 "test"</text></svg>'
    const url = toSVGDataURL(svg)
    expect(url).toContain('data:image/svg+xml')
    const decoded = atob(url.split('base64,')[1])
    expect(decoded).toContain('C#m7')
    expect(decoded).toContain('"test"')
  })

  it('correctly encodes unicode characters', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>Acorde Fá</text></svg>'
    const url = toSVGDataURL(svg)
    expect(url).toContain('data:image/svg+xml;base64,')
  })
})
