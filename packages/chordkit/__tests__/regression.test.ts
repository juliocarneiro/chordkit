import { describe, it, expect } from 'vitest'
import { ChordChart, ChordProgression, autoFinger, noteAtFret } from '../src/index'
import { ensureSvgDimensions } from '../src/export'
import type { ChordDiagram } from '../src/types'

const C: ChordDiagram = {
  name: 'C',
  fingers: [
    { string: 2, fret: 1 },
    { string: 4, fret: 2 },
    { string: 5, fret: 3 },
  ],
  open: [1, 3],
  muted: [6],
}

const E: ChordDiagram = {
  name: 'E',
  fingers: [
    { string: 3, fret: 1 },
    { string: 4, fret: 2 },
    { string: 5, fret: 2 },
  ],
  open: [1, 2, 6],
}

function ids(svg: string): string[] {
  return [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
}

function stringLineWidths(svg: string): number[] {
  return [...svg.matchAll(/<line x1="([\d.]+)" y1="[\d.]+" x2="([\d.]+)"[^>]*stroke-width="([\d.]+)"/g)]
    .filter((m) => m[1] === m[2])
    .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]))
    .map((m) => parseFloat(m[3]))
}

describe('accessibility wiring', () => {
  it('aria-labelledby points at ids that exist in the SVG', () => {
    const svg = ChordChart.svg({ chord: C })
    const labelledBy = svg.match(/aria-labelledby="([^"]+)"/)![1].split(' ')
    expect(labelledBy).toHaveLength(2)
    for (const id of labelledBy) expect(ids(svg)).toContain(id)
  })

  it('describes the real fret when the chart starts above fret 1', () => {
    const svg = ChordChart.svg({ chord: { fingers: [{ string: 1, fret: 1 }], position: 7 } })
    expect(svg).toMatch(/<desc[^>]*>[^<]*string 1 fret 7[^<]*<\/desc>/)
  })
})

describe('ids do not collide between charts', () => {
  it('charts with different themes use different def ids', () => {
    const light = ids(ChordChart.svg({ chord: C, theme: 'light' }))
    const dark = ids(ChordChart.svg({ chord: C, theme: 'dark' }))
    expect(light.filter((id) => dark.includes(id))).toEqual([])
  })

  it('animated charts with different timing use different class names', () => {
    const a = ChordChart.svg({ chord: C, animate: { duration: 100 } })
    const b = ChordChart.svg({ chord: C, animate: { duration: 900 } })
    const cls = (s: string) => s.match(/class="([^"]+)"/)![1]
    expect(cls(a)).not.toBe(cls(b))
  })
})

describe('markup injection', () => {
  it('escapes finger colors', () => {
    const svg = ChordChart.svg({
      chord: { fingers: [{ string: 1, fret: 1, color: '"/><image href="x" onerror="alert(1)' }] },
    })
    expect(svg).not.toContain('<image')
  })

  it('escapes barre colors', () => {
    const svg = ChordChart.svg({
      chord: { fingers: [], barres: [{ fret: 1, fromString: 1, toString: 6, color: '"/><image href="x"' }] },
    })
    expect(svg).not.toContain('<image')
  })

  it('escapes theme colors and font family', () => {
    const svg = ChordChart.svg({
      chord: C,
      theme: { dotColor: '"><script>1</script>', background: '"><script>2</script>', fontFamily: 'x</text><script>3</script>' },
    })
    expect(svg).not.toContain('<script>')
  })

  it('escapes chord names in the progression aria-label', () => {
    const svg = ChordProgression.svg({ chords: [{ name: 'A" onload="alert(1)', fingers: [] }] })
    expect(svg.split('\n')[0]).not.toContain(' onload="')
  })
})

describe('orientation', () => {
  it('horizontal renders a wide diagram that differs from vertical', () => {
    const vertical = ChordChart.svg({ chord: C })
    const horizontal = ChordChart.svg({ chord: C, orientation: 'horizontal' })
    expect(horizontal).not.toBe(vertical)
    const [, w, h] = horizontal.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)!
    expect(parseFloat(w)).toBeGreaterThan(parseFloat(h))
  })

  it('horizontal draws strings as horizontal lines', () => {
    const svg = ChordChart.svg({ chord: C, orientation: 'horizontal' })
    const horizontalLines = [...svg.matchAll(/<line x1="[\d.]+" y1="([\d.]+)" x2="[\d.]+" y2="([\d.]+)"/g)]
      .filter((m) => m[1] === m[2])
    expect(horizontalLines).toHaveLength(6)
  })
})

describe('string thickness', () => {
  it('draws the lowest string (left) thicker than the highest (right)', () => {
    const widths = stringLineWidths(ChordChart.svg({ chord: C }))
    expect(widths).toHaveLength(6)
    expect(widths[0]).toBeGreaterThan(widths[5])
  })

  it('mirrors thickness in left-handed mode', () => {
    const widths = stringLineWidths(ChordChart.svg({ chord: C, leftHanded: true }))
    expect(widths[5]).toBeGreaterThan(widths[0])
  })
})

describe('autoFinger', () => {
  const byString = (chord: ChordDiagram) =>
    Object.fromEntries(autoFinger(chord).fingers.map((f) => [f.string, f.text]))

  it('starts at finger 1 when there is no barre', () => {
    expect(byString(C)).toEqual({ 2: '1', 4: '2', 5: '3' })
  })

  it('gives the lower-pitched string the lower finger on a shared fret', () => {
    expect(byString(E)).toEqual({ 3: '1', 5: '2', 4: '3' })
  })

  it('only treats fingers under the barre as finger 1', () => {
    const chord: ChordDiagram = {
      fingers: [{ string: 6, fret: 1 }, { string: 2, fret: 2 }],
      barres: [{ fret: 1, fromString: 1, toString: 3 }],
    }
    expect(byString(chord)).toEqual({ 6: '2', 2: '3' })
  })
})

describe('noteAtFret', () => {
  it('understands enharmonic spellings', () => {
    expect(noteAtFret('Cb', 0)).toBe('B')
    expect(noteAtFret('E#', 0)).toBe('F')
    expect(noteAtFret('B#', 1)).toBe('C#')
  })

  it('is case-insensitive on the note letter', () => {
    expect(noteAtFret('bb', 0)).toBe('A#')
    expect(noteAtFret('e', 1)).toBe('F')
  })

  it('handles negative frets', () => {
    expect(noteAtFret('E', -13)).toBe('D#')
  })

  it('returns an empty string for something that is not a note', () => {
    expect(noteAtFret('H', 0)).toBe('')
    expect(noteAtFret('', 3)).toBe('')
  })
})

describe('input validation', () => {
  it('rejects an instrument without strings', () => {
    expect(() => ChordChart.svg({ chord: { fingers: [] }, instrument: { strings: 0, frets: 4 } })).toThrow(/strings/)
  })

  it('rejects an instrument without frets', () => {
    expect(() => ChordChart.svg({ chord: { fingers: [] }, instrument: { strings: 6, frets: 0 } })).toThrow(/frets/)
  })

  it('rejects a finger on a string that does not exist', () => {
    expect(() => ChordChart.svg({ chord: { fingers: [{ string: 9, fret: 1 }] } })).toThrow(/string 9/)
  })

  it('rejects a finger outside the visible frets', () => {
    expect(() => ChordChart.svg({ chord: { fingers: [{ string: 1, fret: 12 }] } })).toThrow(/fret 12/)
  })

  it('rejects a non-positive width', () => {
    expect(() => ChordChart.svg({ chord: C, width: 0 })).toThrow(/width/)
  })

  it('renders a single-string instrument without NaN or Infinity', () => {
    const svg = ChordChart.svg({ chord: { fingers: [{ string: 1, fret: 2 }] }, instrument: { strings: 1, frets: 4 } })
    expect(svg).not.toMatch(/NaN|Infinity/)
  })
})

describe('ensureSvgDimensions', () => {
  const rootTag = (svg: string) => svg.match(/<svg\b[^>]*>/)![0]

  it('adds width and height to a root <svg> that has none', () => {
    const progression = ChordProgression.svg({ chords: [C, E] })
    const tag = rootTag(ensureSvgDimensions(progression))
    expect(tag).toMatch(/\swidth="412"/)
    expect(tag).toMatch(/\sheight="[\d.]+"/)
  })

  it('adds the missing height in proportion to an existing width', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200" width="50"><rect width="1" height="1"/></svg>'
    const tag = rootTag(ensureSvgDimensions(svg))
    expect(tag).toMatch(/\swidth="50"/)
    expect(tag).toMatch(/\sheight="100"/)
  })

  it('applies explicit width and height over existing ones', () => {
    const tag = rootTag(ensureSvgDimensions(ChordChart.svg({ chord: C }), 500, 600))
    expect(tag).toMatch(/\swidth="500"/)
    expect(tag).toMatch(/\sheight="600"/)
    expect(tag.match(/\swidth="/g)).toHaveLength(1)
  })
})

describe('animation CSS', () => {
  const svg = ChordChart.svg({ chord: C, animate: true })

  it('scales each dot around its own centre', () => {
    expect(svg).toContain('transform-box: fill-box')
  })

  it('turns the animation off for users who prefer reduced motion', () => {
    expect(svg).toContain('prefers-reduced-motion')
  })
})
