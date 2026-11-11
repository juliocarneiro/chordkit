import { describe, it, expect } from 'vitest'
import type { ChordDiagram } from 'chordkit'
import { guitar, ukulele } from '../src/index'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLATS: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }

const INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
}

/**
 * Chord tones for a name. `required` leaves out the perfect fifth of four-note chords,
 * which standard voicings such as the open C7 (x32310) legitimately omit.
 */
function chordTones(name: string): { all: string[]; required: string[] } {
  const [, rawRoot, suffix] = name.match(/^([A-G][#b]?)(.*)$/)!
  const root = NOTES.indexOf(FLATS[rawRoot] ?? rawRoot)
  const intervals = INTERVALS[suffix]
  if (!intervals) throw new Error(`No interval table for suffix "${suffix}" (${name})`)
  const note = (i: number) => NOTES[(root + i) % 12]
  const required = intervals.length > 3 ? intervals.filter((i) => i !== 7) : intervals
  return { all: intervals.map(note), required: required.map(note) }
}

/** Notes that actually sound, lowest string first in `tuning` */
function soundingNotes(chord: ChordDiagram, tuning: string[]): string[] {
  const strings = tuning.length
  const offset = (chord.position ?? 1) - 1
  const notes = new Set<string>()

  for (let s = 1; s <= strings; s++) {
    if (chord.muted?.includes(s)) continue
    let fret = 0
    if (!chord.open?.includes(s)) {
      const frets = [
        ...chord.fingers.filter((f) => f.string === s).map((f) => f.fret),
        ...(chord.barres ?? [])
          .filter((b) => s >= Math.min(b.fromString, b.toString) && s <= Math.max(b.fromString, b.toString))
          .map((b) => b.fret),
      ]
      if (frets.length === 0) throw new Error(`${chord.name}: string ${s} is neither open, muted nor fretted`)
      fret = Math.max(...frets) + offset
    }
    notes.add(NOTES[(NOTES.indexOf(tuning[strings - s]) + fret) % 12])
  }
  return [...notes].sort()
}

describe.each([
  ['guitar', guitar, ['E', 'A', 'D', 'G', 'B', 'E']],
  ['ukulele', ukulele, ['G', 'C', 'E', 'A']],
] as const)('%s chords sound like their name', (_label, chords, tuning) => {
  it.each(Object.entries(chords))('%s', (key, chord) => {
    expect(chord.name).toBe(key)
    const sounding = soundingNotes(chord, [...tuning])
    const tones = chordTones(key)
    expect(tones.all).toEqual(expect.arrayContaining(sounding))
    expect(sounding).toEqual(expect.arrayContaining(tones.required))
  })
})

describe.each([
  ['guitar', guitar, 6],
  ['ukulele', ukulele, 4],
] as const)('%s chords are well-formed', (_label, chords, strings) => {
  it.each(Object.entries(chords))('%s', (_key, chord) => {
    const fretted = new Set<number>(chord.fingers.map((f) => f.string))
    for (const s of chord.open ?? []) {
      expect(chord.muted ?? []).not.toContain(s)
      expect(fretted.has(s)).toBe(false)
    }
    for (const s of [...fretted, ...(chord.open ?? []), ...(chord.muted ?? [])]) {
      expect(s).toBeGreaterThanOrEqual(1)
      expect(s).toBeLessThanOrEqual(strings)
    }
  })
})
