import { describe, it, expect } from 'vitest'
import { midiToNote, noteToMidi } from '../src/midi'

describe('midiToNote', () => {
  it('converts middle C (MIDI 60) correctly', () => {
    const note = midiToNote(60)
    expect(note.midi).toBe(60)
    expect(note.name).toBe('C')
    expect(note.octave).toBe(4)
    expect(note.frequency).toBeCloseTo(261.63, 1)
  })

  it('converts A4 (MIDI 69, concert pitch) correctly', () => {
    const note = midiToNote(69)
    expect(note.name).toBe('A')
    expect(note.octave).toBe(4)
    expect(note.frequency).toBeCloseTo(440, 1)
  })

  it('uses sharp names by default', () => {
    expect(midiToNote(70).name).toBe('A#')
  })

  it('uses flat names when style is flat', () => {
    expect(midiToNote(70, 'flat').name).toBe('Bb')
  })

  it('handles the lowest MIDI note (0 = C-1)', () => {
    const note = midiToNote(0)
    expect(note.name).toBe('C')
    expect(note.octave).toBe(-1)
  })

  it('handles the highest MIDI note (127)', () => {
    const note = midiToNote(127)
    expect(note.name).toBe('G')
    expect(note.octave).toBe(9)
  })

  it('clamps values outside 0–127', () => {
    expect(midiToNote(-5).midi).toBe(0)
    expect(midiToNote(200).midi).toBe(127)
  })
})

describe('noteToMidi', () => {
  it('converts A4 to MIDI 69', () => {
    expect(noteToMidi('A', 4)).toBe(69)
  })

  it('converts C4 (middle C) to MIDI 60', () => {
    expect(noteToMidi('C', 4)).toBe(60)
  })

  it('converts C-1 to MIDI 0', () => {
    expect(noteToMidi('C', -1)).toBe(0)
  })

  it('handles sharp note names', () => {
    expect(noteToMidi('C#', 4)).toBe(61)
    expect(noteToMidi('F#', 4)).toBe(66)
  })

  it('handles flat note names', () => {
    expect(noteToMidi('Bb', 3)).toBe(58)  // Bb3: (3+1)*12 + 10 = 58
    expect(noteToMidi('Eb', 4)).toBe(63)  // Eb4: (4+1)*12 + 3  = 63
  })

  it('returns -1 for unrecognized note names', () => {
    expect(noteToMidi('H', 4)).toBe(-1)
    expect(noteToMidi('X#', 4)).toBe(-1)
  })

  it('is consistent with midiToNote', () => {
    for (let midi = 0; midi <= 127; midi++) {
      const { name, octave } = midiToNote(midi)
      expect(noteToMidi(name, octave)).toBe(midi)
    }
  })
})
