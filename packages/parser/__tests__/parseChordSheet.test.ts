import { describe, it, expect } from 'vitest'
import { parseChordSheet } from '../src/parseChordSheet'

describe('parseChordSheet', () => {
  it('parses a single line with chord markers', () => {
    const lines = parseChordSheet('[Am]Yesterday [F]all my [C]troubles')
    expect(lines).toHaveLength(1)
    const segments = lines[0].segments
    expect(segments[0].chord?.root).toBe('A')
    expect(segments[0].chord?.quality).toBe('minor')
    expect(segments[0].text).toBe('Yesterday ')
    expect(segments[1].chord?.root).toBe('F')
    expect(segments[1].text).toBe('all my ')
    expect(segments[2].chord?.root).toBe('C')
    expect(segments[2].text).toBe('troubles')
  })

  it('parses text before the first chord as a plain segment', () => {
    const lines = parseChordSheet('Intro text [Am]chord here')
    const segments = lines[0].segments
    expect(segments[0].chord).toBeUndefined()
    expect(segments[0].text).toBe('Intro text ')
    expect(segments[1].chord?.root).toBe('A')
  })

  it('handles a line with no chord markers', () => {
    const lines = parseChordSheet('Just some lyrics without chords')
    expect(lines[0].segments).toHaveLength(1)
    expect(lines[0].segments[0].chord).toBeUndefined()
    expect(lines[0].segments[0].text).toBe('Just some lyrics without chords')
  })

  it('splits text into multiple lines', () => {
    const sheet = parseChordSheet('[Am]line one\n[F]line two')
    expect(sheet).toHaveLength(2)
    expect(sheet[0].segments[0].chord?.root).toBe('A')
    expect(sheet[1].segments[0].chord?.root).toBe('F')
  })

  it('handles empty lines', () => {
    const sheet = parseChordSheet('[Am]first\n\n[G]third')
    expect(sheet).toHaveLength(3)
    expect(sheet[1].segments[0].text).toBe('')
  })

  it('parses complex chord names inside markers', () => {
    const lines = parseChordSheet('[C#maj7]start [Am7/G]end')
    const segments = lines[0].segments
    expect(segments[0].chord?.root).toBe('C#')
    expect(segments[0].chord?.extensions).toContain('maj7')
    expect(segments[1].chord?.bass).toBe('G')
  })

  it('handles unknown chord markers gracefully (chord is undefined)', () => {
    const lines = parseChordSheet('[notachord]text')
    expect(lines[0].segments[0].chord).toBeUndefined()
    expect(lines[0].segments[0].text).toBe('text')
  })

  it('returns an empty segments array for an empty string', () => {
    const lines = parseChordSheet('')
    expect(lines).toHaveLength(1)
    expect(lines[0].segments[0].text).toBe('')
  })
})
