import { describe, it, expect } from 'vitest'
import { ChordChart } from '../src/index'
import type { ChordChartOptions } from '../src/index'

const AM_CHORD: ChordChartOptions = {
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
    position: 1,
  },
}

describe('ChordChart.svg (static)', () => {
  it('generates valid SVG output', () => {
    const svg = ChordChart.svg(AM_CHORD)
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
  })

  it('includes the chord title', () => {
    const svg = ChordChart.svg(AM_CHORD)
    expect(svg).toContain('Am')
  })

  it('includes accessibility attributes', () => {
    const svg = ChordChart.svg(AM_CHORD)
    expect(svg).toContain('role="img"')
    expect(svg).toContain('<title>')
    expect(svg).toContain('<desc>')
    expect(svg).toContain('aria-labelledby')
  })

  it('includes open string indicators', () => {
    const svg = ChordChart.svg(AM_CHORD)
    expect(svg).toContain('String 1 open')
    expect(svg).toContain('String 5 open')
  })

  it('includes muted string indicators', () => {
    const svg = ChordChart.svg(AM_CHORD)
    expect(svg).toContain('String 6 muted')
  })

  it('renders with dark theme', () => {
    const svg = ChordChart.svg({ ...AM_CHORD, theme: 'dark' })
    expect(svg).toContain('#1a1a2e')
  })

  it('renders with custom theme', () => {
    const svg = ChordChart.svg({
      ...AM_CHORD,
      theme: { dotColor: '#ff0000' },
    })
    expect(svg).toContain('#ff0000')
  })

  it('hides tuning labels when showTuning is false', () => {
    const withTuning = ChordChart.svg({ ...AM_CHORD, showTuning: true })
    const withoutTuning = ChordChart.svg({ ...AM_CHORD, showTuning: false })
    expect(withTuning.length).toBeGreaterThan(withoutTuning.length)
  })

  it('renders position label for higher frets', () => {
    const svg = ChordChart.svg({
      ...AM_CHORD,
      chord: { ...AM_CHORD.chord, position: 5 },
      position: 5,
    })
    expect(svg).toContain('5fr')
  })
})

describe('ChordChart.svg instruments', () => {
  it('renders ukulele (4 strings)', () => {
    const svg = ChordChart.svg({
      instrument: 'ukulele',
      chord: {
        name: 'C',
        fingers: [{ string: 1, fret: 3 }],
        open: [2, 3, 4],
      },
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('C')
  })

  it('renders bass (4 strings)', () => {
    const svg = ChordChart.svg({
      instrument: 'bass',
      chord: {
        name: 'E',
        fingers: [{ string: 4, fret: 2 }],
        open: [1, 2, 3],
      },
    })
    expect(svg).toContain('<svg')
  })

  it('renders custom instrument config', () => {
    const svg = ChordChart.svg({
      instrument: { strings: 7, frets: 6 },
      chord: {
        name: 'Custom',
        fingers: [{ string: 1, fret: 1 }],
      },
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('Custom')
  })
})

describe('ChordChart.svg barre chords', () => {
  it('renders barre chord', () => {
    const svg = ChordChart.svg({
      instrument: 'guitar',
      chord: {
        name: 'F',
        fingers: [
          { string: 3, fret: 2 },
          { string: 5, fret: 3 },
          { string: 4, fret: 3 },
        ],
        barres: [{ fret: 1, fromString: 1, toString: 6 }],
        position: 1,
      },
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('F')
  })

  it('renders barre with custom text', () => {
    const svg = ChordChart.svg({
      instrument: 'guitar',
      chord: {
        name: 'Bm',
        fingers: [
          { string: 3, fret: 3 },
          { string: 4, fret: 4 },
          { string: 5, fret: 4 },
        ],
        barres: [{ fret: 2, fromString: 1, toString: 5, text: '1' }],
        position: 1,
      },
    })
    expect(svg).toContain('1')
  })
})

describe('ChordChart.svg left-handed mode', () => {
  it('produces different SVG output from right-handed', () => {
    const rightHanded = ChordChart.svg(AM_CHORD)
    const leftHanded = ChordChart.svg({ ...AM_CHORD, leftHanded: true })
    expect(leftHanded).toContain('<svg')
    expect(leftHanded).not.toBe(rightHanded)
  })

  it('mirrors finger dot positions', () => {
    const rh = ChordChart.svg({
      instrument: 'guitar',
      chord: { name: 'Test', fingers: [{ string: 1, fret: 1 }] },
    })
    const lh = ChordChart.svg({
      instrument: 'guitar',
      chord: { name: 'Test', fingers: [{ string: 1, fret: 1 }] },
      leftHanded: true,
    })
    const circleRegex = /<circle[^>]*cx="([^"]+)"[^>]*filter/g
    const rhDots = [...rh.matchAll(circleRegex)].map((m) => parseFloat(m[1]))
    const lhDots = [...lh.matchAll(circleRegex)].map((m) => parseFloat(m[1]))
    expect(rhDots.length).toBeGreaterThan(0)
    expect(lhDots.length).toBeGreaterThan(0)
    expect(rhDots[0]).not.toBe(lhDots[0])
  })

  it('moves position label to the right side', () => {
    const lh = ChordChart.svg({
      ...AM_CHORD,
      chord: { ...AM_CHORD.chord, position: 5 },
      position: 5,
      leftHanded: true,
    })
    expect(lh).toContain('5fr')
    expect(lh).toContain('text-anchor="start"')
  })

  it('preserves accessibility in left-handed mode', () => {
    const svg = ChordChart.svg({ ...AM_CHORD, leftHanded: true })
    expect(svg).toContain('role="img"')
    expect(svg).toContain('<title>')
    expect(svg).toContain('String 1 open')
    expect(svg).toContain('String 6 muted')
  })

  it('works with barre chords in left-handed mode', () => {
    const svg = ChordChart.svg({
      instrument: 'guitar',
      chord: {
        name: 'F',
        fingers: [
          { string: 3, fret: 2 },
          { string: 5, fret: 3 },
          { string: 4, fret: 3 },
        ],
        barres: [{ fret: 1, fromString: 1, toString: 6 }],
      },
      leftHanded: true,
    })
    expect(svg).toContain('<svg')
    expect(svg).toContain('F')
  })
})

describe('ChordChart builder API', () => {
  it('builds and draws via fluent API', () => {
    const chart = new ChordChart()
    const svg = chart
      .instrument('guitar')
      .chord({
        name: 'G',
        fingers: [
          { string: 1, fret: 3 },
          { string: 5, fret: 2 },
          { string: 6, fret: 3 },
        ],
        open: [2, 3, 4],
      })
      .theme('light')
      .draw()

    expect(svg).toContain('<svg')
    expect(svg).toContain('G')
  })

  it('throws when chord is not set', () => {
    const chart = new ChordChart()
    expect(() => chart.draw()).toThrow('chord data is required')
  })

  it('supports method chaining', () => {
    const chart = new ChordChart()
    const result = chart
      .instrument('ukulele')
      .theme('dark')
      .showTuning(false)
      .showFretMarkers(false)
      .width(300)
      .orientation('vertical')
      .leftHanded()

    expect(result).toBe(chart)
  })

  it('renders left-handed via builder', () => {
    const svg = new ChordChart()
      .instrument('guitar')
      .chord({
        name: 'Am',
        fingers: [
          { string: 2, fret: 1 },
          { string: 3, fret: 2 },
          { string: 4, fret: 2 },
        ],
        muted: [6],
        open: [1, 5],
      })
      .leftHanded()
      .draw()

    expect(svg).toContain('<svg')
    expect(svg).toContain('Am')
  })
})

describe('ChordChart.svg noteLabels', () => {
  it('shows note names on finger dots when noteLabels is true', () => {
    const svg = ChordChart.svg({
      ...AM_CHORD,
      noteLabels: true,
    })
    expect(svg).toContain('>C<')
    expect(svg).toContain('>A<')
  })

  it('shows flat notation when noteLabels is flat', () => {
    const svg = ChordChart.svg({
      instrument: 'guitar',
      chord: {
        name: 'F',
        fingers: [{ string: 1, fret: 2 }],
      },
      noteLabels: 'flat',
    })
    expect(svg).toContain('>Gb<')
  })

  it('works via builder API', () => {
    const svg = new ChordChart()
      .instrument('guitar')
      .chord({
        name: 'Am',
        fingers: [{ string: 2, fret: 1 }],
      })
      .noteLabels()
      .draw()
    expect(svg).toContain('>C<')
  })
})

describe('ChordChart.svg autoFinger', () => {
  it('adds finger numbers when autoFinger is true', () => {
    const svg = ChordChart.svg({
      ...AM_CHORD,
      autoFinger: true,
    })
    expect(svg).toContain('>2<')
    expect(svg).toContain('>3<')
    expect(svg).toContain('>4<')
  })

  it('works via builder API', () => {
    const svg = new ChordChart()
      .instrument('guitar')
      .chord({
        name: 'Am',
        fingers: [
          { string: 2, fret: 1 },
          { string: 3, fret: 2 },
          { string: 4, fret: 2 },
        ],
      })
      .autoFinger()
      .draw()
    expect(svg).toContain('>2<')
  })
})

describe('ChordChart.svg animate', () => {
  it('includes CSS animation when animate is true', () => {
    const svg = ChordChart.svg({
      ...AM_CHORD,
      animate: true,
    })
    expect(svg).toContain('<style>')
    expect(svg).toContain('@keyframes ck-pop')
    expect(svg).toContain('ck-dot-0')
  })

  it('adds animation classes to finger dots', () => {
    const svg = ChordChart.svg({
      ...AM_CHORD,
      animate: true,
    })
    expect(svg).toContain('class="ck-dot-0"')
    expect(svg).toContain('class="ck-dot-1"')
    expect(svg).toContain('class="ck-dot-2"')
  })

  it('adds animation classes to barre chords', () => {
    const svg = ChordChart.svg({
      instrument: 'guitar',
      chord: {
        name: 'F',
        fingers: [{ string: 3, fret: 2 }],
        barres: [{ fret: 1, fromString: 1, toString: 6 }],
      },
      animate: true,
    })
    expect(svg).toContain('class="ck-barre-0"')
    expect(svg).toContain('ck-barre-grow')
  })

  it('accepts custom animation options', () => {
    const svg = ChordChart.svg({
      ...AM_CHORD,
      animate: { duration: 1200, loop: true },
    })
    expect(svg).toContain('1200ms')
    expect(svg).toContain('infinite')
  })

  it('works via builder API', () => {
    const svg = new ChordChart()
      .chord({
        name: 'Am',
        fingers: [{ string: 2, fret: 1 }],
      })
      .animate()
      .draw()
    expect(svg).toContain('<style>')
    expect(svg).toContain('ck-dot-0')
  })
})
