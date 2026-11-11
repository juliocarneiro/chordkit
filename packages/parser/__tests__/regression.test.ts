import { describe, it, expect } from 'vitest'
import { parseChordName, formatChordName, isValidChordName, parseLine, parseChordSheet } from '../src/index'

describe('parseChordName rejects words that only start like a chord', () => {
  it.each(['Bridge', 'Chorus', 'Capo', 'Fade', 'Dedilhado', 'Cxyz', 'A#b', 'C/', 'Am/', 'G/H'])('%s', (word) => {
    expect(parseChordName(word)).toBeNull()
    expect(isValidChordName(word)).toBe(false)
  })
})

describe('parseChordName keeps the whole chord', () => {
  it('reads CM7 as a major seventh, not a dominant', () => {
    expect(parseChordName('CM7')).toMatchObject({ root: 'C', quality: 'major', extensions: ['maj7'] })
  })

  it('reads minor-major sevenths', () => {
    expect(parseChordName('Cmmaj7')).toMatchObject({ quality: 'minor', extensions: ['maj7'] })
    expect(parseChordName('CmM7')).toMatchObject({ quality: 'minor', extensions: ['maj7'] })
  })

  it('reads altered fifths and ninths', () => {
    expect(parseChordName('Cm7b5')).toMatchObject({ quality: 'minor', extensions: ['7', 'b5'] })
    expect(parseChordName('C7#9')).toMatchObject({ quality: 'dominant', extensions: ['7', '#9'] })
    expect(parseChordName('C7(b9)')).toMatchObject({ quality: 'dominant', extensions: ['7', 'b9'] })
  })

  it('reads a suspension after an extension', () => {
    expect(parseChordName('C7sus4')).toMatchObject({ quality: 'dominant', extensions: ['7', 'sus4'] })
  })

  it('reads six-nine chords without mistaking the 9 for a bass note', () => {
    const parsed = parseChordName('C6/9')!
    expect(parsed.extensions).toEqual(['6/9'])
    expect(parsed.bass).toBeUndefined()
  })

  it('treats 9, 11 and 13 on a major chord as dominant', () => {
    expect(parseChordName('C9')).toMatchObject({ quality: 'dominant', extensions: ['9'] })
    expect(parseChordName('G13')).toMatchObject({ quality: 'dominant', extensions: ['13'] })
  })

  it('does not treat maj9 or add9 as dominant', () => {
    expect(parseChordName('Cmaj9')).toMatchObject({ quality: 'major', extensions: ['maj9'] })
    expect(parseChordName('Cadd9')).toMatchObject({ quality: 'major', extensions: ['add9'] })
  })

  it.each(['Cm7b5', 'C7sus4', 'C7#9', 'C6/9', 'Cmmaj7', 'Am7/G', 'F#dim7', 'Bbmaj7/D'])('round-trips %s', (name) => {
    expect(formatChordName(parseChordName(name)!)).toBe(name)
  })
})

describe('parseLine', () => {
  it('ignores section labels and lyrics that start with A–G', () => {
    expect(parseLine('Bridge: Am F C G (Fade out)')).toEqual(['Am', 'F', 'C', 'G'])
  })
})

describe('parseChordSheet', () => {
  it('keeps a bracketed section label as text instead of a chord', () => {
    const [line] = parseChordSheet('[Chorus]')
    expect(line.segments).toEqual([{ text: '[Chorus]' }])
  })

  it('keeps an unrecognised marker in the text so nothing is lost', () => {
    const [line] = parseChordSheet('la [x]la [Am]la')
    expect(line.segments.map((s) => s.text).join('')).toBe('la [x]la la')
    expect(line.segments.filter((s) => s.chord)).toHaveLength(1)
  })
})
