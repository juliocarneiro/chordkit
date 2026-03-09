import { describe, it, expect } from 'vitest'
import { ChordProgression } from '../src/progression'
import type { ChordDiagram } from '../src/types'

const Am: ChordDiagram = {
  name: 'Am',
  fingers: [
    { string: 2, fret: 1 },
    { string: 3, fret: 2 },
    { string: 4, fret: 2 },
  ],
  muted: [6],
  open: [1, 5],
}

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

const G: ChordDiagram = {
  name: 'G',
  fingers: [
    { string: 1, fret: 3 },
    { string: 5, fret: 2 },
    { string: 6, fret: 3 },
  ],
  open: [2, 3, 4],
}

describe('ChordProgression.svg', () => {
  it('renders multiple chords in a single SVG', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C, G],
      instrument: 'guitar',
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('Am')
    expect(svg).toContain('C')
    expect(svg).toContain('G')
  })

  it('includes a title when provided', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C],
      title: 'Verse',
    })
    expect(svg).toContain('Verse')
  })

  it('uses translate to position each chord', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C],
      chordWidth: 200,
      spacing: 16,
    })
    expect(svg).toContain('translate(0,')
    expect(svg).toContain('translate(216,')
  })

  it('throws when no chords are provided', () => {
    expect(() => ChordProgression.svg({ chords: [] })).toThrow('at least one chord')
  })

  it('applies theme to all chords', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C],
      theme: 'dark',
    })
    expect(svg).toContain('#1a1a2e')
  })

  it('works with a single chord', () => {
    const svg = ChordProgression.svg({
      chords: [Am],
      instrument: 'guitar',
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('Am')
  })

  it('uses unique ID prefixes per chord to avoid collisions', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C, G],
      instrument: 'guitar',
    })
    expect(svg).toContain('id="ck0-dot-grad"')
    expect(svg).toContain('id="ck1-dot-grad"')
    expect(svg).toContain('id="ck2-dot-grad"')
    expect(svg).toContain('id="ck0-shadow"')
    expect(svg).toContain('id="ck1-shadow"')
  })

  it('references the correct prefixed IDs in finger dots', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C],
      instrument: 'guitar',
    })
    expect(svg).toContain('url(#ck0-dot-grad)')
    expect(svg).toContain('url(#ck1-dot-grad)')
    expect(svg).toContain('url(#ck0-shadow)')
    expect(svg).toContain('url(#ck1-shadow)')
  })

  it('uses theme textColor for title, not currentColor', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C],
      title: 'Verse',
      theme: 'dark',
    })
    expect(svg).toContain('fill="#e8e8e8"')
    expect(svg).not.toContain('currentColor')
  })

  it('includes aria-label with chord names', () => {
    const svg = ChordProgression.svg({
      chords: [Am, C, G],
    })
    expect(svg).toContain('aria-label="Chord progression: Am - C - G"')
  })
})
