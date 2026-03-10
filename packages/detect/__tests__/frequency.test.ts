import { describe, it, expect } from 'vitest'
import { frequencyToMidi, frequencyToNote, centDeviation } from '../src/frequency'

describe('frequencyToMidi', () => {
  it('converts A4 (440 Hz) to MIDI 69', () => {
    expect(frequencyToMidi(440)).toBe(69)
  })

  it('converts middle C (261.63 Hz) to MIDI 60', () => {
    expect(frequencyToMidi(261.63)).toBe(60)
  })

  it('snaps to the nearest semitone', () => {
    // 432 Hz is close to A4 (440 Hz), should snap to MIDI 69
    expect(frequencyToMidi(432)).toBe(69)
    // 450 Hz is closer to A#4 (466.16 Hz) than A4 (440 Hz)? No, closer to A4.
    expect(frequencyToMidi(445)).toBe(69)
  })

  it('returns -1 for non-positive frequencies', () => {
    expect(frequencyToMidi(0)).toBe(-1)
    expect(frequencyToMidi(-100)).toBe(-1)
  })

  it('returns -1 for frequencies outside MIDI range', () => {
    expect(frequencyToMidi(1)).toBe(-1)
    expect(frequencyToMidi(20000)).toBe(-1)
  })
})

describe('frequencyToNote', () => {
  it('converts A4 (440 Hz) to A4', () => {
    const note = frequencyToNote(440)
    expect(note?.name).toBe('A')
    expect(note?.octave).toBe(4)
  })

  it('returns null for out-of-range frequencies', () => {
    expect(frequencyToNote(0)).toBeNull()
    expect(frequencyToNote(-10)).toBeNull()
  })

  it('respects the style option', () => {
    // A#4 = MIDI 70
    const sharp = frequencyToNote(466.16, 'sharp')
    const flat  = frequencyToNote(466.16, 'flat')
    expect(sharp?.name).toBe('A#')
    expect(flat?.name).toBe('Bb')
  })
})

describe('centDeviation', () => {
  it('returns 0 for an exact pitch', () => {
    expect(centDeviation(440)).toBe(0)
    expect(centDeviation(261.63)).toBe(0)
  })

  it('returns a positive value for a sharp frequency', () => {
    expect(centDeviation(445)).toBeGreaterThan(0)
  })

  it('returns a negative value for a flat frequency', () => {
    expect(centDeviation(435)).toBeLessThan(0)
  })

  it('returns 0 for non-positive input', () => {
    expect(centDeviation(0)).toBe(0)
    expect(centDeviation(-10)).toBe(0)
  })
})
